import { ConflictException, Controller, Delete, Get, NotFoundException, Param, Put, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { User } from 'src/entities/user.entity';
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { ILike } from 'typeorm';

@Controller('blockeds')
@UseGuards(TransGuard)
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
    const other = await User.findOneBy({username: ILike(username.replace(/([%_])/g, "\\$1"))});
    if (!other)
      throw new NotFoundException('Username not found.');
    if (other.ft_login == req.user)
      throw new NotFoundException('You cannot block yourself.');
    const otherfriendship = await UserRelationship.findOneBy({
      ownerLogin: other.ft_login,
      relatedLogin: req.user,
      status: UserRelationship.Status.FRIEND
    });
    otherfriendship?.remove();
    let relationship = await UserRelationship.findOneBy({
      ownerLogin: req.user,
      relatedLogin: other.ft_login
    });
    if (relationship)
      relationship.status = UserRelationship.Status.BLOCKED;
    else
      relationship = await UserRelationship.create({
        ownerLogin: req.user,
        relatedLogin: other.ft_login,
        status: UserRelationship.Status.BLOCKED
      });
    return relationship.save();
  }

  @Delete(':username')
  async delAsBlocked(@Request() req, @Param('username') username) {
    const relationship = await UserRelationship.findOneBy({
      ownerLogin: req.user,
      related: {
        username: ILike(username.replace(/([%_])/g, "\\$1"))
      },
      status: UserRelationship.Status.BLOCKED
    });
    if (!relationship)
      throw new NotFoundException('No blocked user found with this username.')
    return await relationship.remove();
  }

}
