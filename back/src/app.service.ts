import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { throws } from 'assert';
import { userInfo } from 'os';
import { EntityManager } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from './entities/user.entity'


// getManager marquee comme deprecated

@Injectable()
export class AppService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager
  ){}




  async newUser() {
      //const user = this.manager.create(User, {username: "lolo", ft_login: "yoyo"});
      const bis = this.manager.create(User);
      bis.username = 'jock';
      bis.ft_login = 'jock';

      //await this.manager.save(user);
      await this.manager.save(bis);
      
      const U = await this.manager.findOne(User, {where: {username: 'jock'}});
      return U;
      //await this.manager.insert(User, {username: "labintei",ft_login: "labintei"});
      //await this.manager.insert(User, {username: "popo", ft_login: 'popopopo'});
  }


  async NewMessage() {

    const usersrc = await this.manager.findOne(User, {where : { username: "labintei" }});
    const userdest = await this.manager.find(User, {where: { username: 'popo'}});

    // voir si il ne faut pas rajouter deux trois choses
    this.manager.insert(Message, {
      content: 'vrrrrrrrrrrrrrrrrrrrrrrrr',
      sender: usersrc
    })
  }

  getHello(): string {
    return 'Hello World!';
  }

}
