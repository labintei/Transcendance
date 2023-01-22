<<<<<<< HEAD
import { Global, Module } from '@nestjs/common';
=======
import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
>>>>>>> master
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.comtroller';
// a enlever possiblement
import { SocketGateway } from 'src/socket/socket.gateway';

//@Global()
@Module({
  controllers: [GameController],
<<<<<<< HEAD
  providers: [GameGateway, GameService/*, SocketGateway*/]
=======
  providers: [GameGateway]
>>>>>>> master
})
export class GameModule {}
