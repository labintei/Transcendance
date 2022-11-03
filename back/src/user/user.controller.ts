import { Controller, Delete, Get, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { SessionGuard } from 'src/auth/session.guard';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(SessionGuard)
export class UserController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  async getMe(@Request() req): Promise<User> {
    return this.userService.getUserByLogin(req.user.login);
  }

  @Get(':username')
  async getUserAndRelationship(@Request() req, @Param('username') username): Promise<any> {
    const user = await this.userService.getUserByLogin(req.user.login);
    const related = await this.userService.getUserByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    const relationship = await this.userService.getRelationship(user, related);
    return { relationship, ...related };
  }

  @Delete(':username')
  async delRelationship(@Request() req, @Param('username') username) {
    const user = await this.userService.getUserByLogin(req.user.login);
    const related = await this.userService.getUserByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    this.userService.delRelationship(user, related);
  }

}