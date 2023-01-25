import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { UserSocket } from 'src/entities/usersocket.entity';
import { User } from 'src/entities/user.entity';

const chanRoomPrefix = "channel_";
const pingTimeout = 1000000;

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private static io: Server = null;

  afterInit(server: Server) {
    SocketGateway.io = server;
  }

  async handleConnection(client: Socket) {
    client.data.login = (client.request as any).user;
    await UserSocket.create({
      id: client.id,
      userLogin: client.data.login
    }).save();
    const user = await User.findOne({
      select: User.defaultFilter,
      where: {
        ft_login: client.data.login
      }
    });
    if (user.status === User.Status.OFFLINE) {
      user.status = User.Status.ONLINE;
      await user.save();
    }
    console.log('Websocket Client Connected : ' + client.data.login);
    const joinedList = await Channel.joinedList(client.data.login);
    for (let channel of joinedList)
      SocketGateway.channelEmit(channel.id, 'updateUser', user);
    console.log('Joining rooms : ');
    console.log(SocketGateway.channelsToRooms(joinedList));
    SocketGateway.getIO().in(client.id).socketsJoin(SocketGateway.channelsToRooms(joinedList));
    client.data.pingOK = true;
    this.ping(client);
}

  async handleDisconnect(client: Socket) {
    const userSocket = await UserSocket.delete({ id: client.id });
    const user = await User.findOne({
      select: User.defaultFilter,
      relations: {
        sockets: true
      },
      where: {
        ft_login: client.data.login
      }
    });
    if (!user.sockets.length) {
      user.status = User.Status.OFFLINE;
      await user.save();
    }
    console.log('Websocket Client Disconnected : ' + user.ft_login);
    const joinedList = await Channel.joinedList(client.data.login);
    console.log('Leaving rooms : ');
    console.log(SocketGateway.channelsToRooms(joinedList));
    SocketGateway.getIO().in(client.id).socketsLeave(SocketGateway.channelsToRooms(joinedList));
    for (let channel of joinedList)
      SocketGateway.channelEmit(channel.id, 'updateUser', user);
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

  public static getIO(): Server {
    if (!this.io)
      throw new WsException("Uninitialized socket.io instance.")
    return this.io;
  }

  public static async channelEmit(channelId: number, event: string, content: any): Promise<boolean> {
    return this.getIO().in(chanRoomPrefix + channelId).emit(event, content);
  }
 
  public static async userDisconnect(user: User): Promise<void> {
    if (!user.socket)
      return;
    return this.getIO().in(user.socket).disconnectSockets();
  }

  public static channelsToRooms(channels: Channel[]): string[] {
    return channels.map<string>((chan) => { return chanRoomPrefix + chan.id; });
  }

}
