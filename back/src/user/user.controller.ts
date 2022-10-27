import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  @UseGuards(AuthGuard('oauth42'))
  async getUser(@Request() req): Promise<User> {
    return req.user;
  }

  @Get('friends')
  @UseGuards(AuthGuard('oauth42'))
  async getFriends(@Request() req): Promise<any> {
    return this.userService.getFriends(req.user);
  }
}
