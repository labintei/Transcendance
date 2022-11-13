import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';

@Injectable()
export class AppService implements OnModuleInit {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager
  ) {}

  getHello() {
    return 'Hello world';
  }

  generateExamples() {
    this.manager.save([
      this.manager.create(User, {
        ft_login: 'iromanova',
        username: 'aroma'
      }),
      this.manager.create(User, {
        ft_login: 'lbintein',
        username: 'labintei'
      }),
      this.manager.create(User, {
        ft_login: 'omarecha',
        username: 'bmarecha'
      }),
      this.manager.create(User, {
        ft_login: 'edjubert',
        username: 'edjavid'
      }),
      this.manager.create(User, {
        ft_login: 'lraffin',
        username: 'jraffin'
      }),
      this.manager.create(User, {
        ft_login: 'jraffin',
        username: 'jraffin1',
        twoFASecret: "EYPCCGBLGN6HYBYMKA7SOYQROZKU4RYQ",
      })
    ]);
  }

  onModuleInit() {
//  Uncomment the line below to activate the example generation on application load.
//    this.generateExamples();
  }
  getUser(): User {
    let connectedClient:User = {
      username: "Kevin", level: 10, xp:0, victories: 10, defeats: 5, draws: 3, relationships: null,
      ft_login: '',
      status: UserStatus.ONLINE,
      twoFASecret : '',
      channels: []
    };
    return connectedClient;
  }

  getFriends(name:string): User[] {
    let users:User[] = Array(3);
    for (let i:number = 0; i < 3; i++) {
      users[i] = this.getUser();
      users[i].level = i;
      users[i].username += i;
    }
    return users;
  }
  getAll(name:string): User[] {
    let users:User[] = Array(16);

    for (let i:number = 0; i < 16; i++) {
      users[i] = this.getUser();
      users[i].level = i;
      users[i].username += i;
    }
    return users;
  }
}
