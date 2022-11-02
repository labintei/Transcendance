import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { SessionGuard } from 'src/auth/session.guard';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  @UseGuards(SessionGuard)
  async getUser(@Request() req): Promise<User> {
    return this.userService.getUser(req.user.login);
  }

  @Get('friends')
  @UseGuards(SessionGuard)
  async getFriends(@Request() req): Promise<any> {
    const user = await this.userService.getUser(req.user.login);
    return this.userService.getFriends(user);
  }

  @Get('blockeds')
  @UseGuards(SessionGuard)
  async getBlockeds(@Request() req): Promise<any> {
    const user = await this.userService.getUser(req.user.login);
    return this.userService.getBlockeds(user);
  }

  @Get('42')
  @UseGuards(SessionGuard)
  async get42UserInfos(@Request() req): Promise<any> {
    return req.user;
  }

}
