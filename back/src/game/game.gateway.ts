import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {

  @WebSocketServer() private server: Server;

  @SubscribeMessage('loop')
  handleMessage(client: Socket,rawDdata: string): string {
    return "RESPONSE: " + rawDdata;
  }

}
