import { Injectable } from '@nestjs/common';
import { AppDataSource } from './app.datasource';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }

/*  async getUsers(): Promise<User[]> {
    return AppDataSource.manager.
  }*/
}
