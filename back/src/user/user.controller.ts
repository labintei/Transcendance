import { Controller, Delete, Get, NotAcceptableException, NotFoundException, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { LogAsJraffin } from 'src/auth/logAsJraffin.dummyGuard';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { UpdateResult } from 'typeorm';

@Controller('user')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class UserController
{

  @Get()
  async getMe(@Request() req): Promise<User> {
    const me = await User.find({
      select: User.defaultFilter,
      relations: {
        relationships: {
          related: true
        }
      },
      where: {
        ft_login: req.user
      }
    });
    return me[0];
  }

  @Patch()
  async updateMe(@Request() req): Promise<UpdateResult> {
    const toUpdate = {
      username: req.body.username,
      twoFASecret: req.body.twoFASecret
    };
    if (toUpdate.username === undefined && toUpdate.twoFASecret === undefined)
      throw new NotAcceptableException("No updatable field in request body.");
    return await User.update(req.user, toUpdate);
  }

  @Get(':username')
  async getUserAndRelationshipStatus(@Request() req, @Param('username') username): Promise<any> {
    const related = await User.findOne({
      select: User.defaultFilter,
      where: {
        username: username
      }
    });
    if (!related)
      throw new NotFoundException('Username not found.')
    related.relatedships = await UserRelationship.find({
      select : {
        status: true
      },
      where: {
        ownerLogin: req.user,
        relatedLogin: related.ft_login
      }
    });
    return related;
  }

  @Delete(':username')
  async delRelationship(@Request() req, @Param('username') username) {
    const relationship = await UserRelationship.findOneBy({
      ownerLogin: req.user,
      related: {
        username: username
      }
    });
    if (!relationship)
      throw new NotFoundException('No relationship found to this username.')
    relationship.remove();
  }

}
