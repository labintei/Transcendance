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
    let i = 1990;
    let suffix = '';
    while(i > 0)
    {
      const user = this.manager.create(User, {
        username: 'jraffin'+suffix,
        ft_login: i.toString()
      });
      this.manager.save(user);
      suffix = (--i).toString();
    }
    return true;
  /*  const user = this.manager.create(User);
    user.username = 'jraffin';
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
    const retuser = await this.manager.find(User, { where: { username: user.username }});
    const retmsg = await this.manager.find(Message, { where: { id: msg.id }});
    return { retuser, retmsg };*/
  }

  async getUsers() {
    return this.manager.find(User);
  }
}
