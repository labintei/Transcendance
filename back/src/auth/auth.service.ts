import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectEntityManager()
    private manager: EntityManager
  ) {}

  async createUserFrom42Login(login: string): Promise<User> {
    const user = this.manager.create(User);
    user.username = login;
    user.ft_login = login;
    const similarnames = await this.manager.createQueryBuilder()

    while similarnames.indexOf

    return user;
  }

  async findUserFrom42Login(login: string): Promise<User> {
    const user = await this.manager.findOneBy(User, { ft_login: login });

    if ( !user )
      throw new NotFoundException();

    return user;
  }
}
