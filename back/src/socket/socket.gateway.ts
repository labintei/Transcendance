import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/game/game.interfaces';
import { Inject } from '@nestjs/common';

/*
  A suppr
*/
import { GameService } from 'src/game/game.service';

const chanRoomPrefix = "channel_";
const pingTimeout = 60000;//10000;

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private static io: Server = null;
  // je l ai mit en public (doit peut etre utiliser un private et @Inject)
 // public game: GameService;
  //constructor(@Inject(GameService) private gameservice: GameService) {}
  //private gameservice : GameService

  constructor(
    @Inject(GameService) private gameservice: GameService
    ) {}

  //constructor()

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

  @SubscribeMessage('testlaulau')
  async marchepo(client:Socket)
  {
    this.gameservice.test();
    console.log('Bien Implementer');
  }

  @SubscribeMessage('start_game')
  async new_game(client:Socket, data:number)
  {
    client.emit('start', this.gameservice.newGame(client));// renvoit  une Promise
  }


  @SubscribeMessage('left')
  async left(client: Socket, c:any)//: Promise<number>
  {
    var num = await this.gameservice.player1x_left(c[1]);
    console.log('Renvoye L' + String(num))
    client.emit('box1_x', num);
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
      var num = await this.gameservice.player1x_right(c[1]);
      console.log('Renvoye  R' + String(num));
      client.emit('box1_x', num);
  }

  @SubscribeMessage('sphere')
  async sphere(client: Socket, datas:any)
  {
    console.log(datas);
    console.log(datas.box1);

    console.log("Start the game");
    client.emit('notready');
    var zdir = 0.05;
    var l = Math.random();
    if (l < 0.5)
      zdir = -0.05;
    var xangle = l * 0.1;
    var width = 2;
    var sz = Math.floor(datas.z);
    var sx = Math.round(datas.x*10) / 100;
    console.log(1);
    var b1x = Math.round(datas.box1.x * 10) / 100;
     var b2x = Math.round(datas.box2.x * 10) / 100;
    
    datas.z += zdir;
    datas.x += xangle;
    client.emit('newpos', datas.x, datas.z);
    var sxint = Math.round(datas.x);

    if (zdir > 0.1)
      zdir -= 0.005
    else (zdir < (-0.1))
      zdir += 0.005;

    if(sz === (datas.box1.z - 1) &&
      sx >= (b1x - width) && 
      sx <= (b1x + width))
      zdir = -0.3;
    else(sz === datas.box2.z && 
      sx >= (b2x - width) &&
      sx <= (b2x + width))
      zdir = +0.3;
    client.emit('updatez_dir', zdir);
    if(sx === -5 || sx === 5)
    {
      console.log("colision");
      xangle = -xangle;
    }
    client.emit('updatex_angle', xangle);
    if (sz > 7)
    {
      client.emit('add1'); 
      client.emit('reset');
    }
    else if(sz < -7)
    {
      client.emit('add2');
      client.emit('reset');
    }
    client.emit('ready');
  }


}

