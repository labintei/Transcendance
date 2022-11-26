import { Controller, Delete, Get, NotAcceptableException, NotFoundException, Param, Patch, PreconditionFailedException, Request, UseGuards } from '@nestjs/common';
import { LogAsJraffin } from 'src/auth/logAsJraffin.dummyGuard';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UpdateResult } from 'typeorm';

@Controller('user')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class UserController
{

  @Get()
  async getMe(@Request() req): Promise<User> {
    const me = await User.findOne({
      relations: {
        relationships: {
          related: true
        }
      },
      where: {
        ft_login: req.user.login
      }
    });
    return me;
  }

  @Patch()
  async updateMe(@Request() req): Promise<UpdateResult> {
    const toUpdate = {
      username: req.body.username,
      status: req.body.status,
      twoFASecret: req.body.twoFASecret
    };
    if (toUpdate.username === undefined && toUpdate.status === undefined && toUpdate.twoFASecret === undefined)
      throw new NotAcceptableException("No updatable field in request body.");
    if (toUpdate.username.length > 24)
      throw new PreconditionFailedException("Username too long.")
    return User.update(req.user.login, toUpdate);
  }

  @Get(':username')
  async getUserAndRelationshipStatus(@Request() req, @Param('username') username): Promise<User> {
    const me = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    related.relationshipStatus = await me.getRelationship(related);
    return related;
  }

  @Delete(':username')
  async delRelationship(@Request() req, @Param('username') username) {
    const me = await User.findByLogin(req.user.login);
    const related = await User.findByUsername(username);
    if (!related)
      throw new NotFoundException('Username not found.');
    me.delRelationship(related);
  }

}
