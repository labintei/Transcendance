import { Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { LogAsJraffin } from 'src/auth/logAsJraffin.dummyGuard';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';

@Controller('blockeds')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class BlockedsController
{

  @Get()
  async getBlockeds(@Request() req): Promise<User[]> {
    const me = await User.findOneBy({ft_login: req.user});
    return me.getRelationshipList(UserRelationship.Status.BLOCKED);
  }

  @Put(':username')
  async setAsBlocked(@Request() req, @Param('username') username) {
    const me = await User.findOneBy({ft_login: req.user});
    const related = await User.findOneBy({username: username});
    if (!related)
      throw new NotFoundException('Username not found.');
    me.setRelationship(related, UserRelationship.Status.BLOCKED);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const me = await User.findOneBy({ft_login: req.user});
    const related = await User.findOneBy({username: username});
    if (!related || await me.getRelationship(related) !== UserRelationship.Status.BLOCKED)
      throw new NotFoundException('Username not found.');
    me.delRelationship(related);
  }

}
