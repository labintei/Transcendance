import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {//implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() private server: Server;

  // async handleConnection(client) {
  //   // A client has connected
  //   console.log('Websocket Client Connected');

  //   // Notify connected clients of current users
  //   this.server.emit('connections', client.request.session);
  // }

  // async handleDisconnect(client: Socket) {
  //   // A client has disconnected
  //   console.log('Websocket Client Disconnected');

  //   // Notify connected clients of current users
  //   this.server.sockets.emit('connections', client.id + ' DISCONNECTED');
  // }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

}
