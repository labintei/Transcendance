import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Between, EntityManager } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';

@Injectable()
export class UserService implements OnModuleInit {

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
  async createNewUserFrom42Login(login: string, avatarURL: string): Promise<User> {
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
      ft_login: login,
      avatarURL: avatarURL
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
    return this.manager.delete(UserRelationship, {
      owner: user,
      related: relatedUser
    });
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

  async gainXP(user: User, xpToAdd: number): Promise<User> {
    const rest = user.xpAmountForNextLevel - user.xp;
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

  async getPodium(howMany: number): Promise<User[]> {
    return this.manager.find(User, {
      order: {
        rank: "ASC"
      },
      take: howMany
    });
  }

  async getRanksAround(user: User, howMany: number): Promise<User[]> {
    return this.manager.find(User, {
      where: {
        rank: Between(user.rank - howMany, user.rank + howMany)
      },
      order: {
        rank: "ASC"
      }
    });
  }

  async refreshRanks() {
    await this.manager.query(`
      UPDATE "user"
      SET rank = sub.rank
      FROM (
        SELECT
          ft_login,
          ROW_NUMBER()
            OVER(
              ORDER BY
                level DESC,
                xp DESC
            ) AS rank
        FROM "user"
      ) sub
      WHERE "user".ft_login = sub.ft_login
    `);
  }

  onModuleInit() {
    this.refreshRanks();
  }

}
