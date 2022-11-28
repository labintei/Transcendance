import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
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
		await this.socketService.userDisconnect(user);
    user.socket = client.id;
    user.status = User.Status.ONLINE;
    await user.save();
    console.log('Websocket Client Connected : ' + user.ft_login);
    client.data.pingOK = true;
    this.ping(client);
  }

  async handleDisconnect(client: Socket) {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    user.socket = null;
    user.status = User.Status.OFFLINE;
    await user.save();
    console.log('Websocket Client Disconnected : ' + user.ft_login);
  }

  async ping(client: Socket) {
    if (!client.data.pingOK)
      await client.disconnect(true);
    else {
      client.data.pingOK = false;
      await client.emit('ping');
      setTimeout(() => {
        this.ping(client)
      }, pingTimeout);
    }
  }

	@SubscribeMessage('pong')
	async pong(client: Socket) {
		client.data.pingOK = true;
	}
	
}