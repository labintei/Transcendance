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

  async createUser(login: string) {

  }

  async findUserFrom42Login(login: string): Promise<User> {
    const user = await this.manager.findOneBy(User, { ft_login: login });

    if ( !user )
      throw new NotFoundException();

    return user;
  }
}
