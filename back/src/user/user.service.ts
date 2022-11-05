import { ConflictException, ExceptionFilter, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager
  ) {}

  /*
  **  Retreives the sorted list of all usernames containing the given login
  **  potentially followed (or not) by digits (with a non-zero first one).
  **  A real SQL query is used because of the necessity of ordering by
  **  field length and the limitations of typeorm with SQL sorting options.
  **  This sorted array obtained in result permits to check rapidly for the
  **  first available login(+number) available.
  */
  async createNewUserFrom42Login(login: string): Promise<User> {
    const similarusers = await this.manager.query(`
      SELECT username
      FROM "user"
      WHERE username ~ '^`+login+`([1-9][0-9]*)?$'
      ORDER BY LENGTH(username), username ASC;
    `);
    let i = 0;
    let suffix = '';
    for (let val of similarusers) {
      if (val.username !== login + suffix)
        break;
      suffix = (++i).toString();
    }
    const user = this.manager.create(User, {
      username: login + suffix,
      ft_login: login
    });
    return this.manager.save(user);
  }

  async getUserByLogin(login: string): Promise<User> {
    return this.manager.findOneBy(User, { ft_login: login })
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.manager.findOneBy(User, { username: username })
  }

  async updateUser(login: string, updates): Promise<User> {
    let toUpdate = {
      ft_login: login,
      username: updates.username,
      status: updates.status,
      twoFA: updates.twoFA
    };
    try {
      return await this.manager.save(User, toUpdate);
    }
    catch {
      throw new ConflictException("User update failed because of a field value.");
    }
  }

  async setRelationship(user: User, relatedUser: User, relationStatus: UserRelationship.Status): Promise<UserRelationship> {
    return this.manager.save(this.manager.create(UserRelationship, {
      owner: user,
      related: relatedUser,
      status: relationStatus
    }));
  }

  async delRelationship(user: User, relatedUser: User) {
    return this.manager.delete(UserRelationship, this.manager.findOneBy(UserRelationship, {
      owner: user,
      related: relatedUser
    }));
  }

  async getRelationship(user: User, relatedUser:User): Promise<UserRelationship.Status | null> {
    const relationship = await this.manager.findOneBy(UserRelationship, { owner: user, related: relatedUser });
    if (!relationship)
      return null;
    return relationship.status;
  }

  async getRelationshipList(user: User, relationshipStatus: UserRelationship.Status): Promise<User[]> {
    const relationships = await this.manager.find(UserRelationship, {
      relations: {
          related: true
      },
      where: {
        owner : user,
        status: relationshipStatus
      }
    });
    const result = relationships.map((relationship) => relationship.related);
    return result;
  }

  xpAmountForNextLevel(user: User): number {
    const x = 0.03;
    const y = 1.5;
    return ((user.level / x) ^ y);
  }

  async gainXP(user: User, xpToAdd: number): Promise<User> {
    const rest = this.xpAmountForNextLevel(user) - user.xp;
    if (rest <= xpToAdd) {
      ++user.level;
      user.xp = 0;
      xpToAdd -= rest;
    }
    user.xp += xpToAdd;
    return this.manager.save(user);
  }

  async looseXP(user: User, xpToLose: number): Promise<User> {
    if (user.xp > xpToLose)
      user.xp -= xpToLose;
    else
      user.xp = 0;
    return this.manager.save(user);
  }

}
