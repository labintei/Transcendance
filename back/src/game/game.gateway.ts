import { SubscribeMessage, WebSocketGateway, WebSocketServer , } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

WebSocketGateway()
export class GameGateway {

  @WebSocketServer() private io: Server;

  async error(client: Socket, msg: string = ''): Promise<any> {
    await client.emit('error', msg);
    return null;
  }

  @SubscribeMessage('game')
  async game(client: Socket){
    console.log("recu back'");
    this.io.emit('wait_game');
  }

}
