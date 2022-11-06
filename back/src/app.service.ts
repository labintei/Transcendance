import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

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
    this.generateExamples();
  }
}
