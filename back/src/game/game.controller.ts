import { Controller, Get, HttpException, HttpStatus, Param, Request, UseGuards } from '@nestjs/common';
import { GameService } from './game.service'
import { TransGuard } from 'src/auth/trans.guard';
import { Match } from 'src/entities/match.entity';

import { SocketGateway } from 'src/socket/socket.gateway';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';

@Controller('match')
@UseGuards(TransGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':username')
  async invitation(@Request() req , @Param('username') user: string): Promise<number> {
    try {
      const user1 = await User.findOneBy({ft_login: req.user});
      const user2 = await User.findOneBy({username: user});
      if (!user1)
        throw new HttpException("User invalid", HttpStatus.BAD_REQUEST);
      if (!user2)
        throw new HttpException("Invited user invalid", HttpStatus.BAD_REQUEST);
      var c = this.gameService.CreateInvit(user1, user2); // normalement fonctionne 
      var urlredir: string = process.env.REACT_APP_WEBSITE_URL + 'game/' + await c;
      const channelId = await Channel.getDirectChannelId(user1.ft_login, user2.ft_login);
      const message = await Message.create({
        content: urlredir,
        senderLogin: user1.ft_login,
        channelId: channelId
      }).save();
      message.sender = await User.findOne({
        select: User.defaultFilter,
        where: {
          ft_login: user1.ft_login
        }
      });
      SocketGateway.channelEmit(message.channelId, 'message', message);
      return c;
    }
    catch (e) {
      console.log("[Error Invite]", e);
    }
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
