import { Controller, Delete, Get, NotFoundException, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(TransGuard)
export class UserController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  async getMe(@Request() req): Promise<User> {
    return this.userService.getUserByLogin(req.user.ft_login);
  }

  @Patch()
  async updateMe(@Request() req): Promise<User> {
    const updated = await this.userService.updateUser(req.user.ft_login, req.body)
    req.user = { ...req.user, ...updated };
    return updated;
  }

  @Get(':username')
  async getUserAndRelationship(@Request() req, @Param('username') username): Promise<any> {
    const user = await this.userService.getUserByLogin(req.user.ft_login);
    const related = await this.userService.getUserByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    const relationship = await this.userService.getRelationship(user, related);
    return { relationship: relationship, ...related };
  }

  @Delete(':username')
  async delRelationship(@Request() req, @Param('username') username) {
    const user = await this.userService.getUserByLogin(req.user.ft_login);
    const related = await this.userService.getUserByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    this.userService.delRelationship(user, related);
  }

}
