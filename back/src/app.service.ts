import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager
  ) {}

  getHello() {
    return 'Hello world';
  }

  getDetails()
  {
    return this.manager.connection.options;
  }

  async newUser() {
    const user = this.manager.create(User);
    user.username = 'jraffin8';
    user.ft_login = 'jraffin8';
    console.log(user.username + ' created.');
    await this.manager.save(user);
    console.log(user.username + ' saved.');
    const msg = this.manager.create(Message);
    msg.content = 'content';
    msg.sender = user;
    console.log('message created.');
    await this.manager.save(msg);
    console.log('message saved.');
/*    const ret = await this.manager.findOne(User, {
      where: {
        username: user.username
      }
    });
    const [msgs] = await ret.messages;*/
    return user;
  }

  async getUsers() {
    return this.manager.find(User);
  }
}
