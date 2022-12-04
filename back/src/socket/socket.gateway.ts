import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { SocketAddress } from 'net';
import { identity } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';

const chanRoomPrefix = "channel_";
const pingTimeout = 60000;//10000;

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private static io: Server = null;

  afterInit(server: Server) {
    SocketGateway.io = server;
  }

  async handleConnection(client: Socket) {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    client.data.login = user.ft_login;
		await SocketGateway.userDisconnect(user);
    user.socket = client.id;
    user.status = User.Status.ONLINE;
    await user.save();
    console.log('Websocket Client Connected : ' + user.ft_login);
    const joinedList = await Channel.find({
      relations: {
        users: true
      },
      select: Channel.defaultFilter,
      where: {
        users: {
          userLogin: user.ft_login,
          joined: true
        }
      }
    });
    SocketGateway.userJoinRooms(user, SocketGateway.channelsToRooms(joinedList));
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
/*
  @SubscribeMessage('game')
	async game(client: Socket) {
		// client.data.pingOK = true;
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    console.log('recu');
    return SocketGateway.getIO().in(user.socket).emit('game_mess')
  }*/


  @SubscribeMessage('left')
  async left(client: Socket, data: number)//: Promise<number>
  {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    await console.log("data recu : ");
    await console.log(data);
    await(data -= 0.2);
    await client.emit('player1_move', data);
    //await console.log("data renvoyer : ");
    //await console.log(data);
    //await client.emit('player1_move', data);
    
    //return SocketGateway.getIO().in(user.socket).emit('player1_move', data);
    //return data;
  }

  @SubscribeMessage('end_left')
  async end_left(client: Socket)
  {
    //console.log('endleft')
  }

  @SubscribeMessage('right')
  async right(client: Socket, data: number)//: Promise<number>
  {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    await console.log(data);
    await(data += 0.2);
    //return data;
    // a voir
    await client.emit('player1_move', data);
    //return SocketGateway.getIO().in(user.socket).emit('player1_move', data);
    //await client.emit('player1_move', data);
  }

  
  @SubscribeMessage('sphere')
  async sphere(client: Socket, Box1:any, Box2:any, x:number, z:number)
  {
    var zdir = 0.05;
    var l = Math.random();
    if (l < 0.5)
      zdir = -0.05;
    console.log(zdir);
    var xangle = l * 0.1;
    var width = 2;//constante
    // correspond a une constante mais bref
    var sz = Math.floor(z);
    var sx = Math.round(x*10) / 100;
    var b1x = Math.round(Box1.current.position.x * 10) /100;
    var b2x = Math.round(Box2.current.position.x * 10) / 100;
    // good widht ?? 2
    
    z += zdir;
    x += xangle;
    var sxint = Math.round(x);

    if (zdir > 0.1)
      zdir -= 0.005
    else (zdir < (-0.1))
      zdir += 0.005;
    
    // coll
    if(sz === (Box1.current.position.z - 1) &&
      sx >= (b1x - width) && 
      sx <= (b1x + width))
      zdir = -0.3;
    else(sz === Box2.current.position.z && 
      sx >= (b2x - width) &&
      sx <= (b2x + width))
      zdir = +0.3;

    if(sx === -5 || sx === 5)// sort du cotee gauche
    {
      console.log("colision");
      xangle = -xangle;
    }
    if (sz > 7)
      client.emit('add1_reset'); 
    else if(sz < -7)
      client.emit('add2_reset');
    client.emit('notreaadygame');
  }

	public static getIO(): Server {
		if (!this.io)
			throw new WsException("Uninitialized socket.io instance.")
		return this.io;
	}

	public static async userEmit(user: User, event: string, content: any): Promise<boolean> {
		return this.getIO().in(user.socket).emit(event, content);
	}

	public static async channelEmit(channel: Channel, event: string, content: any): Promise<boolean> {
		return this.getIO().in(chanRoomPrefix + channel.id).emit(event, content);
	}

	public static async userJoinRooms(user: User, rooms: string|string[]): Promise<void> {
		return this.getIO().in(user.socket).socketsJoin(rooms);
	}

	public static async userLeaveRooms(user: User, rooms: string|string[]): Promise<void> {
		return this.getIO().in(user.socket).socketsLeave(rooms);
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

