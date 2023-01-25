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
          user1: {
            ft_login: req.user
          }
        },
        {
          user2: {
            ft_login: req.user
          }
        }
      ]
    });
  }

}
