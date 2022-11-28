import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

@Controller('match')
@UseGuards(TransGuard)
export class GameController {

    @Get("history")
    async gethistory(@Request() req): Promise<Match[]> {
      const me = await User.findBy({ft_login: req.user.login});
      return Match.find({
        relations: {
          user1:true,
          user2:true
        },
        where: [{
            user1: me
          },
          {
            user2: me
          }
        ] as FindOptionsWhere<Match>[]
      });
    }

}
