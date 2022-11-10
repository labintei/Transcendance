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
        username: 'aroma',
        avatarURL: 'no_image.jpg',
        level:  3,
        xp: 657
      }),
      this.manager.create(User, {
        ft_login: 'lbintein',
        username: 'labintei',
        avatarURL: 'no_image.jpg',
        level:  5,
        xp: 628
      }),
      this.manager.create(User, {
        ft_login: 'omarecha',
        username: 'bmarecha',
        avatarURL: 'no_image.jpg',
        level:  2,
        xp: 0
      }),
      this.manager.create(User, {
        ft_login: 'edjubert',
        username: 'edjavid',
        avatarURL: 'no_image.jpg',
        level:  3,
        xp: 231
      }),
      this.manager.create(User, {
        ft_login: 'lraffin',
        username: 'jraffin',
        avatarURL: 'no_image.jpg',
        level:  1,
        xp: 630
      }),
      this.manager.create(User, {
        ft_login: 'jraffin',
        username: 'jraffin1',
        twoFASecret: null,//"EYPCCGBLGN6HYBYMKA7SOYQROZKU4RYQ",
        avatarURL: 'https://cdn.intra.42.fr/users/57b6404e1c58329a2ca86db66c132b62/jraffin.jpg',
        level:  3,
        xp: 587
      })
    ]);
  }

  onModuleInit() {
//  Uncomment the line below to activate the example generation on application load.
    this.generateExamples();
  }
}
