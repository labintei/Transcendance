import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';

@Controller('match')
@UseGuards(TransGuard)
export class GameController {

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
