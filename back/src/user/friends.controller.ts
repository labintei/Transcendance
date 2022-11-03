import { Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { SessionGuard } from 'src/auth/session.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { UserService } from './user.service';

@Controller('friends')
@UseGuards(SessionGuard)
export class FriendController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  async getFriends(@Request() req): Promise<User[]> {
    const user = await this.userService.getUserByLogin(req.user.login);
    return this.userService.getRelationshipList(user, UserRelationship.Status.FRIEND);
  }

  @Put(':username')
  async setAsFriend(@Request() req, @Param('username') username) {
    const user = await this.userService.getUserByLogin(req.user.login);
    const related = await this.userService.getUserByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    this.userService.setRelationship(user, related, UserRelationship.Status.FRIEND);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const user = await this.userService.getUserByLogin(req.user.login);
    const related = await this.userService.getUserByUsername(username);
    if (!related || await this.userService.getRelationship(user, related) !== UserRelationship.Status.FRIEND)
      throw new NotFoundException('Username not found.');
    this.userService.delRelationship(user, related);
  }

}
