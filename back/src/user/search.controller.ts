import { Controller, Get, NotFoundException, Param, Query, Request, UseGuards } from "@nestjs/common";
import { LogAsJraffin } from "src/auth/logAsJraffin.dummyGuard";
import { TransGuard } from "src/auth/trans.guard";
import { User } from "src/entities/user.entity";

@Controller('search')
@UseGuards(TransGuard)
@UseGuards(LogAsJraffin) // Test Guard to uncomment to act as if you are authenticated ad 'jraffin'
export class SearchController {

  @Get(':username')
  async searchUser(@Param('username') username, @Query('count') count, @Request() req): Promise<number | User[]> {
    const me = await User.findOneBy({ft_login: req.user});
    if (!me)
      throw new NotFoundException('Username ' + username + ' was not found.');
    if (!count)
      count = "10";
    return User.getSimilarWithRelashionship(username, me, Number(count));
  }

}
