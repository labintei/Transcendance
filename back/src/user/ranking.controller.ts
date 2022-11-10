import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";
import { UserService } from "./user.service";

@Controller('ranking')
@UseGuards(TransGuard)
export class RankingController {

  constructor(
    private readonly userService: UserService
  ) {}

  @Get()
  async getPodium(@Query('count') count): Promise<User[]> {
    if (!count)
      count = 10;
    return this.userService.getPodium(count);
  }

  @Get('user')
  async getMyRank(@Request() req, @Query('count') count): Promise<number | User[]> {
    const user = await this.userService.getUserByLogin(req.user.login);
    const countNum = parseInt(count);
    if (countNum)
      return this.userService.getRanksAround(user, countNum);
    return user.rank;
  }

  @Get('user/:username')
  async getUserRank(@Param('username') username, @Query('count') count): Promise<number | User[]> {
    const user = await this.userService.getUserByUsername(username);
    const countNum = parseInt(count);
    if (countNum)
      return this.userService.getRanksAround(user, countNum);
    return user.rank;
  }
}
