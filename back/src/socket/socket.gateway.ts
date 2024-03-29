import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from 'src/app.service';
import { Channel } from 'src/entities/channel.entity';
import { UserSocket } from 'src/entities/usersocket.entity';
import { User } from 'src/entities/user.entity';
import { ChannelUser } from 'src/entities/channeluser.entity';

const chanRoomPrefix = "channel_";
const pingTimeout = 5000;

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
    console.log('Websocket Client Connected : ' + client.data.login + ' [id:' + client.id + ']');
    const allJoined = await Channel.findBy({users: { userLogin: client.data.login, status: ChannelUser.Status.JOINED} });
    for (let channel of allJoined)
      SocketGateway.channelEmit(channel.id, 'updateUser', user);
    SocketGateway.getIO().in(client.id).socketsJoin(SocketGateway.channelsToRooms(allJoined));
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
    console.log('Websocket Client Disconnected : ' + client.data.login + ' [id:' + client.id + ']');
    const allJoined = await Channel.findBy({users: { userLogin: client.data.login, status: ChannelUser.Status.JOINED} });
    SocketGateway.getIO().in(client.id).socketsLeave(SocketGateway.channelsToRooms(allJoined));
    for (let channel of allJoined)
      SocketGateway.channelEmit(channel.id, 'updateUser', user);
  }

  private static pingTimeoutName(socketId: string): string {
    return 'pingTimeout-' + socketId;
  }

  ping(client: Socket) {
    AppService.deleteTimeout(SocketGateway.pingTimeoutName(client.id));
    if (!client.data.pingOK)
      client.disconnect(true);
    else {
      client.data.pingOK = false;
      client.emit('ping');
      AppService.setTimeout(
        SocketGateway.pingTimeoutName(client.id),
        () => { this.ping(client) },
        pingTimeout
      );
    }
  }

  @SubscribeMessage('pong')
  pong(client: Socket) {
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

  public static async allChannelLeavesRoom(channelId: number) {
    this.getIO().socketsLeave(chanRoomPrefix + channelId);
  }

  public static async userEmit(userLogin: string,event: string, content: any) {
    const userSockets = await UserSocket.findBy({userLogin: userLogin});
    for (let sock of userSockets)
      this.getIO().in(sock.id).emit(event, content);
  }

  public static async userJoinRooms(userLogin: string, rooms: string[]) {
    const userSockets = await UserSocket.findBy({userLogin: userLogin});
    for (let sock of userSockets)
      this.getIO().in(sock.id).socketsJoin(rooms);
  }

  public static async userLeaveRooms(userLogin: string, rooms: string[]) {
    const userSockets = await UserSocket.findBy({userLogin: userLogin});
    for (let sock of userSockets)
      this.getIO().in(sock.id).socketsLeave(rooms);
  }

  public static async userJoinChannelRoom(userLogin: string, channelId: number) {
    const userSockets = await UserSocket.findBy({userLogin: userLogin});
    for (let sock of userSockets)
      this.getIO().in(sock.id).socketsJoin(chanRoomPrefix + channelId);
  }

  public static async userLeaveChannelRoom(userLogin: string, channelId: number) {
    const userSockets = await UserSocket.findBy({userLogin: userLogin});
    for (let sock of userSockets)
      this.getIO().in(sock.id).socketsLeave(chanRoomPrefix + channelId);
  }

  public static async userDisconnect(userLogin: string) {
    const userSockets = await UserSocket.findBy({userLogin: userLogin});
    for (let sock of userSockets)
      this.getIO().in(sock.id).disconnectSockets();
  }

  public static channelsToRooms(channels: Channel[]): string[] {
    return channels.map<string>((chan) => { return chanRoomPrefix + chan.id; });
  }

}
