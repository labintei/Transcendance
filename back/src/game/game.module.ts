import { Global, Module } from '@nestjs/common';
import { GameController } from './game.controller';

import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
//import { GameController } from './game.controller';
// a enlever possiblement
import { SocketGateway } from 'src/socket/socket.gateway';

//@Global()
@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService/*, SocketGateway*/]
})
export class GameModule {}
