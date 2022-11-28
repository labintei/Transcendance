import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/entities/user.entity';
import { SocketService } from './socket.service';

const pingTimeout = 10000;

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
		private socketService: SocketService
	){}

	private io: Server;

  afterInit(server: Server) {
    this.socketService.io = server;
		this.io = server;
  }

  async handleConnection(client: Socket) {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    client.data.login = user.ft_login;
    console.log('Websocket Client Connected : ' + user.ft_login);
    user.socket = client.id;
    user.status = User.Status.ONLINE;
    user.save();
    client.data.pingOK = true;
    this.ping(client);
  }

  async handleDisconnect(client: Socket) {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    console.log('Websocket Client Disconnected : ' + user.ft_login);
    user.socket = null;
    user.status = User.Status.OFFLINE;
    user.save();
  }

  async ping(client: Socket) {
    if (!client.data.pingOK)
      client.disconnect(true);
    else {
      client.data.pingOK = false;
      client.emit('ping');
      setTimeout(() => {
        this.ping(client)
      }, pingTimeout);
    }
  }

}