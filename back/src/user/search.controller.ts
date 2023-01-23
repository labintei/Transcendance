import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";
import { UserRelationship } from "src/entities/userrelationship.entity";

@Controller('search')
@UseGuards(TransGuard)
export class SearchController {

  @Get(':username')
  async searchUser(@Param('username') partialUsername:string, @Query('count') count, @Request() req): Promise<User[]> {
    let howMany = Number(count);
    if (isNaN(howMany) || howMany > 50)
      howMany = 10;

    let query = User.createQueryBuilder("user")
      .leftJoinAndMapMany(
        "user.relatedships",
        UserRelationship,
        "relationship",
        "relationship.owner = :ownerLogin AND relationship.related = user.ft_login",
        { ownerLogin: req.user }
      )
      .where(
        "user.username ILIKE :testUsername",
        { testUsername: partialUsername.replace(/([%_])/g, "\\$1") + '%' }
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
      .take(howMany);
      
      console.log(query.getQueryAndParameters());
      return await query.getMany();
  }

}
