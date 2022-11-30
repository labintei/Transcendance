import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { LogAsJraffin } from "src/auth/logAsJraffin.dummyGuard";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";
import { UserRelationship } from "src/entities/userrelationship.entity";
import { Any, ILike, In, IsNull, Not } from "typeorm";

@Controller('search')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class SearchController {

  @Get(':username')
  async searchUser(@Param('username') partialUsername, @Query('count') count, @Request() req): Promise<User[]> {
    let howMany = Number(count);
    if (isNaN(howMany) || howMany > 50)
      howMany = 10;
    return await User.createQueryBuilder("user")
      .leftJoinAndMapMany(
        "user.relatedships",
        UserRelationship,
        "relationship",
        "relationship.owner = :ownerLogin AND relationship.related = user.ft_login",
        { ownerLogin: req.user }
      )
      .where(
        "user.username ILIKE :testUsername",
        { testUsername: partialUsername+'%' }
      )
      .select([
        "user.ft_login",
        "user.username",
        "user.status",
        "user.avatarURL",
        "user.level",
        "user.xp",
        "user.victories",
        "user.defeats",
        "user.draws",
        "user.rank",
        "relationship.status"
        ])
      .take(howMany)
      .getMany();
  }

}
