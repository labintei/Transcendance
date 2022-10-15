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

  // va creer deux messages qui vont se renvoyer des choses
  async newUser() {
    // va inserer directement
    // peut egalement faire 
    // const t = await.this.manager.create(User, {}) , peut etre mieux pour gerer les exceptions

      await this.manager.insert(User, {username: "labintei",ft_login: "labintei"});
      await this.manager.insert(User, {username: "popo", ft_login: 'popopopo'});
  }

  async NewMessage() {

    // Utiliser des fond one sinon User[], fondOne fondOneOrFail
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
