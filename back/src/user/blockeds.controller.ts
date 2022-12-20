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
    return User.find({
      select: User.defaultFilter,
      relations: {
        relatedships: true
      },
      where: {
        relatedships: {
          ownerLogin: req.user,
          status: UserRelationship.Status.BLOCKED
        }
      }
    });
  }

  @Put(':username')
  async setAsBlocked(@Request() req, @Param('username') username): Promise<UserRelationship> {
    const related = await User.findOneBy({username: username});
    if (!related)
      throw new NotFoundException('Username not found.');
    return UserRelationship.create({
      ownerLogin: req.user,
      relatedLogin: related.ft_login,
      status: UserRelationship.Status.BLOCKED
    }).save();
  }

  @Delete(':username')
  async delAsBlocked(@Request() req, @Param('username') username) {
    const relationship = await UserRelationship.findOneBy({
      ownerLogin: req.user,
      related: {
        username: username
      },
      status: UserRelationship.Status.BLOCKED
    });
    if (!relationship)
      throw new NotFoundException('No blocked user found with this username.')
    relationship.remove();
  }

}
