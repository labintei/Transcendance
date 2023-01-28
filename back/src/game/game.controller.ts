import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { GameService } from './game.service'
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';

@Controller('match')
@UseGuards(TransGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':username')
  async invitation(@Request() req , @Param('username') user: string): Promise<number> {
    var c = this.gameService.CreateInvit(req.user, user); // normalement fonctionne 
    var urlredir = process.env.REACT_APP_FRONTEND_URL + '/game/' + await c;
    return c;
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
