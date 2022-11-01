import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getUser(@Request() req): Promise<User> {
    return this.userService.findUserFrom42Login(req.user.login);
  }

  @Get('friends')
  @UseGuards(AuthenticatedGuard)
  async getFriends(@Request() req): Promise<any> {
    const user = await this.userService.findUserFrom42Login(req.user.login);
    return this.userService.getFriends(user);
  }

  @Get('blockeds')
  @UseGuards(AuthenticatedGuard)
  async getBlockeds(@Request() req): Promise<any> {
    const user = await this.userService.findUserFrom42Login(req.user.login);
    return this.userService.getBlockeds(user);
  }

  @Get('42')
  @UseGuards(AuthenticatedGuard)
  async get42UserInfos(@Request() req): Promise<any> {
    return req.user;
  }

}
