import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() private server: Server;

  async handleConnection(client: Socket) {
    // A client has connected
    const req = client.request as any;
    console.log('Websocket Client Connected : ' + req.user);

  }

  async handleDisconnect(client: Socket) {
    // A client has disconnected
    console.log('Websocket Client Disconnected');

  }

  @SubscribeMessage('chat')
  async onChat(client, message) {
    client.broadcast.emit('chat', message);
  }
}
