import { Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';

@Controller('blockeds')
@UseGuards(TransGuard)
export class BlockedsController
{

  @Get()
  async getBlockeds(@Request() req): Promise<User[]> {
    const user = await User.findByLogin(req.user.login);
    return user.getRelationshipList(UserRelationship.Status.BLOCKED);
  }

  @Put(':username')
  async setAsBlocked(@Request() req, @Param('username') username) {
    const user = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    user.setRelationship(related, UserRelationship.Status.BLOCKED);
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const user = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related || await user.getRelationship(related) !== UserRelationship.Status.BLOCKED)
      throw new NotFoundException('Username not found.');
    user.delRelationship(related);
  }

}
