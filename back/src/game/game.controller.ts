import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';

@Controller('match')
@UseGuards(TransGuard)
export class GameController {

  @Get(':username')
  async createMatchOrReturnExisting(@Request() req, @Param('username') user1:string): Promise<number> {
    
    return 0;
  }

  @Get('history')
  async gethistory(@Request() req): Promise<Match[]> {
    return Match.find({
      relations: {
        user1:true,
        user2:true
      },
      where: [
        {
          user1Login: req.user,
          status: Match.Status.ENDED
        },
        {
          user2Login: req.user,
          status: Match.Status.ENDED
        },
      ]
    });
  }

}
