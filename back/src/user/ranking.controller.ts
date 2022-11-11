import { Controller, Get, NotFoundException, Param, Query, Request, UseGuards } from "@nestjs/common";
import { LogAsJraffin } from "src/auth/logAsJraffin.dummyGuard";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";

@Controller('ranking')
@UseGuards(TransGuard)
//@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class RankingController {

  @Get()
  async getPodium(@Query('count') count): Promise<User[]> {
    if (!count)
      count = "10";
    return User.getPodium(parseInt(count));
  }

  @Get('user')
  async getMyRank(@Request() req, @Query('count') count): Promise<number | User[]> {
    const me = await User.findByLogin(req.user.login);
    if (!count)
      count = "0";
    return me.getRanksAround(parseInt(count));
  }

  @Get('user/:username')
  async getUserRank(@Param('username') username, @Query('count') count): Promise<number | User[]> {
    const user = await User.findByUsername(username);
    if (!user)
      throw new NotFoundException('Username ' + username + ' was not found.');
    if (!count)
      count = "0";
    return user.getRanksAround(parseInt(count));
  }
}
