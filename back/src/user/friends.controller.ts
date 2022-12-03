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
    return User.find({
      relations: {
        relatedships: true
      },
      select: User.defaultFilter,
      where: {
        relatedships: {
          ownerLogin: req.user,
          status: UserRelationship.Status.FRIEND
        }
      }
    });
  }

  @Get("andNotFriends")
  async getAll(@Request() req): Promise<User[]> {
    const users = await User.find();
    const friends = await User.find({
      relations: {
        relatedships: true
      },
      select: User.defaultFilter,
      where: {
        relatedships: {
          ownerLogin: req.user,
          status: UserRelationship.Status.FRIEND
        }
      }
    })
   /* users.forEach((user) => {
      if (friends.includes(user))
        user.relationshipStatus = UserRelationship.Status.FRIEND;
    });*/
    return users;
  }

  @Put(':username')
  async setAsFriend(@Request() req, @Param('username') username): Promise<UserRelationship> {
    const related = await User.findOneBy({username: username});
    if (!related)
      throw new NotFoundException('Username not found.');
    return UserRelationship.create({
      ownerLogin: req.user,
      relatedLogin: related.ft_login,
      status: UserRelationship.Status.FRIEND
    }).save();
  }

  @Delete(':username')
  async delAsFriend(@Request() req, @Param('username') username) {
    const relationship = await UserRelationship.findOneBy({
      ownerLogin: req.user,
      related: {
        username: username
      },
      status: UserRelationship.Status.FRIEND
    });
    if (!relationship)
      throw new NotFoundException('No friend found with this username.')
    relationship.remove();
  }

}
