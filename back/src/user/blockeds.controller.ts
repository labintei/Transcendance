import { Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { UserService } from './user.service';

@Controller('blockeds')
@UseGuards(TransGuard)
export class BlockedsController
{

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  async getBlockeds(@Request() req): Promise<User[]> {
    const user = await this.userService.getUserByLogin(req.user.login);
    return this.userService.getRelationshipList(user, UserRelationship.Status.BLOCKED);
  }

  @Put(':username')
  async setAsBlocked(@Request() req, @Param('username') username) {
    const user = await this.userService.getUserByLogin(req.user.login);
    const related = await this.userService.getUserByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    this.userService.setRelationship(user, related, UserRelationship.Status.BLOCKED);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const user = await this.userService.getUserByLogin(req.user.login);
    const related = await this.userService.getUserByUsername(username);
    if (!related || await this.userService.getRelationship(user, related) !== UserRelationship.Status.BLOCKED)
      throw new NotFoundException('Username not found.');
    this.userService.delRelationship(user, related);
  }

}
