import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { RelationStatus, UserRelation } from 'src/entities/userrelation.entity';

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
  async createDefaultUserFrom42Login(login: string): Promise<User> {
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

  async findUserFrom42Login(login: string): Promise<User> {
    let user = await this.manager.findOneBy(User, { ft_login: login });
    if (!user) {
      console.log('42 login "' + login + '" has not been found! Creating...');
      user = await this.createDefaultUserFrom42Login(login);
      console.log('User "' + user.username + '" Created.');
    }
    else
      console.log('User "' + user.username + '" with 42 login "' + login + '" has been found.');
    return user;
  }

  async getUser(login: string): Promise<User> {
    return this.manager.findOneBy(User, { ft_login: login })
  }

  async getFriends(user: User): Promise<UserRelation[]> {
    const friends = this.manager.find(UserRelation, {
      select: {
        related: {
          username: true
        }
      },
      where: {
        owner: user,
        status: RelationStatus.FRIEND
      }
    });
    return friends;
  }

  async getBlockeds(user: User): Promise<UserRelation[]> {
    const friends = this.manager.find(UserRelation, {
      select: {
        related: {
          username: true
        }
      },
      where: {
        owner: user,
        status: RelationStatus.BLOCKED
      }
    });
    return friends;
  }
}
