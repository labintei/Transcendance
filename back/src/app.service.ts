import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { pseudoRandomBytes } from 'crypto';
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
    this.manager.save(this.manager.create(User, {
      ft_login: 'iromanova',
      username: 'aroma'
    }));
    this.manager.save(this.manager.create(User, {
      ft_login: 'lbintein',
      username: 'labintei'
    }));
    this.manager.save(this.manager.create(User, {
      ft_login: 'omarecha',
      username: 'bmarecha'
    }));
    this.manager.save(this.manager.create(User, {
      ft_login: 'edjubert',
      username: 'edjavid'
    }));
    this.manager.save(this.manager.create(User, {
      ft_login: 'lraffin',
      username: 'jraffin'
    }));
    this.manager.save(this.manager.create(User, {
      ft_login: 'jraffin',
      username: 'jraffin1',
      twoFA: "123456",
    }));
  }

  onModuleInit() {
    this.generateExamples();
  }
}
