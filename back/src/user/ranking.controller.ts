import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { LogAsJraffin } from "src/auth/logAsJraffin.dummyGuard";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";
import { Between } from "typeorm";

import { Socket } from 'socket.io';

@Controller('ranking')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class RankingController {

  @Get()
  async getPodium(@Query('count') count): Promise<User[]> {
    let howMany = Number(count);
    if (isNaN(howMany) || howMany > 50)
      howMany = 10;
    return User.find({
      select : User.defaultFilter,
      order: {
        rank: "ASC"
      },
      take: howMany
    });
  }

  @Get('user')
  async getMyRan(@Request() req, client:Socket, @Query('count') count): Promise<number | User[]> {
    const me = await User.findOneBy({ft_login: req.user});
    if (count === undefined)
      return me.rank;
    let howMany = Number(count);
    if (isNaN(howMany) || howMany > 20)
      howMany = 0;
    return User.find({
      select : User.defaultFilter,
      where: {
        rank: Between(me.rank - howMany, me.rank + howMany)
      },
      order: {
        rank: "ASC"
      }
    });
  }

  @Get('user')
  async getMyRank(@Request() req, @Query('count') count): Promise<number | User[]> {
    const me = await User.findOneBy({ft_login: req.user});
    if (count === undefined)
      return me.rank;
    let howMany = Number(count);
    if (isNaN(howMany) || howMany > 20)
      howMany = 0;
    return User.find({
      select : User.defaultFilter,
      where: {
        rank: Between(me.rank - howMany, me.rank + howMany)
      },
      order: {
        rank: "ASC"
      }
    });
  }

  @Get('user/:username')
  async getUserRank(@Param('username') username, @Query('count') count): Promise<number | User[]> {
    const user = await User.findOneBy({username: username});
    if (count === undefined)
      return user.rank;
    let howMany = Number(count);
    if (isNaN(howMany) || howMany > 20)
      howMany = 0;
    return User.find({
      select : User.defaultFilter,
      where: {
        rank: Between(user.rank - howMany, user.rank + howMany)
      },
      order: {
        rank: "ASC"
      }
    });
  }

}
