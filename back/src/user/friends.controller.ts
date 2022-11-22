import { Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { LogAsJraffin } from 'src/auth/logAsJraffin.dummyGuard';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';

@Controller('friends')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class FriendsController
{

  @Get()
  async getFriends(@Request() req): Promise<User[]> {
    const me = await User.findByLogin(req.user);
    return me.getRelationshipList(UserRelationship.Status.FRIEND);
  }

  @Get("andNotFriends")
  async getAll(@Request() req): Promise<{friends:User[], others:User[]}> {
    const me = await User.findByLogin(req.user);
    const frnds:User[] = await me.getRelationshipList(UserRelationship.Status.FRIEND);
    const oth:User[] = Array();
    return {friends:frnds, others:oth};
  }

  @Put(':username')
  async setAsFriend(@Request() req, @Param('username') username) {
    const me = await User.findByLogin(req.user);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    me.setRelationship(related, UserRelationship.Status.FRIEND);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const me = await User.findByLogin(req.user);
    const related = await User.findByUsername(username);
    if (!related || await me.getRelationship(related) !== UserRelationship.Status.FRIEND)
      throw new NotFoundException('Username not found.');
    me.delRelationship(related);
  }

}
