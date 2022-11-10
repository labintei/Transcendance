import { Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';

@Controller('friends')
@UseGuards(TransGuard)
export class FriendsController
{

  @Get()
  async getFriends(@Request() req): Promise<User[]> {
    const user = await User.findByLogin(req.user.login);
    return user.getRelationshipList(UserRelationship.Status.FRIEND);
  }

  @Put(':username')
  async setAsFriend(@Request() req, @Param('username') username) {
    const user = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    user.setRelationship(related, UserRelationship.Status.FRIEND);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const user = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related || await user.getRelationship(related) !== UserRelationship.Status.FRIEND)
      throw new NotFoundException('Username not found.');
    user.delRelationship(related);
  }

}
