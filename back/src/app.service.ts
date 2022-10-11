import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
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
    const user = this.manager.create(User,
      {
        username: 'jraffin',
        ft_login: 'jraffin'
      }
    );
    console.log(user.username + ' created.');
    await this.manager.save(user);
    return this.manager.findOne(User, {
      where: {
        username: user.username
      }
    });
  }

  async getUsers() {
    return this.manager.find(User);
  }
}
