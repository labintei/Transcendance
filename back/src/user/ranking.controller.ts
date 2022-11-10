import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";

@Controller('ranking')
@UseGuards(TransGuard)
export class RankingController {

  @Get()
  async getPodium(@Query('count') count): Promise<User[]> {
    if (!count)
      count = 10;
    return User.getPodium(count);
  }

  @Get('user')
  async getMyRank(@Request() req, @Query('count') count): Promise<number | User[]> {
    const user = await User.findByLogin(req.user.login);
    const countNum = parseInt(count);
    if (countNum)
      return user.getRanksAround(countNum);
    return user.rank;
  }

  @Get('user/:username')
  async getUserRank(@Param('username') username, @Query('count') count): Promise<number | User[]> {
    const user = await User.findByUsername(username);
    const countNum = parseInt(count);
    if (countNum)
      return user.getRanksAround(countNum);
    return user.rank;
  }
}
