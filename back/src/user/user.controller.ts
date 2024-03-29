import { Controller, Delete, ConflictException, Get, NotFoundException, Param, Patch, PreconditionFailedException, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { DeepPartial, ILike, UpdateResult } from 'typeorm';

@Controller('user')
@UseGuards(TransGuard)
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
        ft_login: req.user
      }
    });
    if (me.twoFASecret)
      me.twoFASecret = "Activated";
    return me;
  }

  @Patch()
  async updateMe(@Request() req): Promise<User> {
    const toUpdate = {
      username: req.body.username,
      twoFASecret: req.body.twoFASecret,
      bgdChoice: req.body.bgdChoice,
      padColor: req.body.padColor,
      ballColor: req.body.ballColor,
      boardColor: req.body.boardColor
    };
    if (toUpdate.username !== undefined)
    {
      if (/\s/.test(toUpdate.username))
        throw new PreconditionFailedException("A username cannot contain whitespaces.");
      if (toUpdate.username.length < 3)
        throw new PreconditionFailedException("Username too short (must have at least 3 characters).");
      if (toUpdate.username.length > 24)
        throw new PreconditionFailedException("Username too long (must have at most 24 characters).");
      let updated: UpdateResult;
      try {
        await User.update(req.user, { username: toUpdate.username });
      }
      catch (e) {
        throw new ConflictException("Username " + toUpdate.username + " is already taken.");
      }
    }
    delete toUpdate.username;
    const user = await User.findOneBy({ ft_login: req.user });
    return User.merge(user, toUpdate as DeepPartial<User>).save();
  }

  @Get(':username')
  async getUserAndRelationshipStatus(@Request() req, @Param('username') username): Promise<any> {
    const related = await User.findOne({
      select: User.defaultFilter,
      where: {
        username: ILike(username.replace(/([%_])/g, "\\$1"))
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
