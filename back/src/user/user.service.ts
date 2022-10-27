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
}
