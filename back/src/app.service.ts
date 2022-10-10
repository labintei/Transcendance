import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {

  constructor(
    @InjectDataSource()
    private datasource: DataSource
  ) {}

  getHello(): string {
    return this.datasource.isInitialized?'true':'false';
  }

  getDetails()
  {
    return this.datasource.getRepository(User);
  }

  newUser(): string {
    this.datasource.synchronize();
    this.datasource.manager.create(User, {
      username: 'jraffin',
      ft_login: 'jraffin',

    })
    this.datasource.synchronize();
    return 'created';
  }

  async getUsers(): Promise<User[]> {
    this.datasource.synchronize();
    return this.datasource.manager.find(User);
  }
}
