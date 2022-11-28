import { Controller, Delete, Get, NotFoundException, Param, Patch, Put, Request, UseGuards } from '@nestjs/common';
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
    const me = await User.findByLogin(req.user.login);
    return me.getRelationshipList(UserRelationship.Status.FRIEND);
  }

  @Get("andNotFriends")
  async getAll(@Request() req): Promise<User[]> {
    const me = await User.findOneBy({ ft_login : req.user.login});
    const users = await User.find();
    const friends = await me.getRelationshipList(UserRelationship.Status.FRIEND)
    users.forEach((user) => {
      if (friends.includes(user))
        user.relationshipStatus = UserRelationship.Status.FRIEND;
    });
    return users;
  }

  @Put(':username')
  async setAsFriend(@Request() req, @Param('username') username) {
    const me = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    console.log("Patch test");
    if (!related)
      throw new NotFoundException('Username not found.');
    me.setRelationship(related, UserRelationship.Status.FRIEND);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const me = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related || await me.getRelationship(related) !== UserRelationship.Status.FRIEND)
      throw new NotFoundException('Username not found.');
    me.delRelationship(related);
  }

}
