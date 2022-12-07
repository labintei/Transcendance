import { Global, Module } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  providers: [SocketGateway, GameService],
  exports: [SocketGateway]
})
export class SocketModule {}
