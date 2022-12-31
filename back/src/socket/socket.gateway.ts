import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/game/game.service';
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

  constructor(
    private gameservice: GameService
    ) {}

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
    var l = await this.gameservice.newGame(client);// renvoit  une Promise
    console.log(l);
    console.log(l[0]);
    console.log(l[1]);
    client.emit('start', l);
    client.emit('newpos', [0,0]);
    // je peut lancer le timer ici
    
    
    //this.gameservice.setTimer(l[0]);
  }


  @SubscribeMessage('left')
  async left(client: Socket, c:any)//: Promise<number>
  {
    //if(await(c[0] === 1))
    var num = await this.gameservice.player1x_left(c[1]);
    //var numbis = await (num/10);
    //client.emit('box1_x', num);
    
    
    //else
      //client.emit('box2_x', this.gameservice.player2x_left(c[1]));
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
    //if(await(c[0] === 1))
    //{
      var num = await this.gameservice.player1x_right(c[1]);
      //var numbis = await (num/10);
      console.log('Renvoye  R' + String(num));
      //console.log('Numbis ' + String(numbis));
      
      
      //client.emit('box1_x', num);
    
    
      //}
    //else
      //client.emit('box_2', this.gameservice.player2x_right(c[1]));
  }

  @SubscribeMessage('ball')
  async sphere(client: Socket, data:number)
  {
    // socket.emit('ball', [GetID, zdirection, l, xangle]);
    //var a = await this.gameservice.sphereroom(data);
    //console.log(String(a[0]) + " " + String(a[1]));
    //console.log(this.gameservice.sphereroom(data));
    console.log('Once');

    var i = setInterval(() => {
      var a = this.gameservice.sphereroom(data);
      var posBox1 = this.gameservice.getBox1(data);
      console.log('Box1: ' +  String(posBox1));
      //console.log('Ball:');
      //console.log(a);

      client.emit('box1_x', posBox1);
      
      client.emit('newpos', a);
    }, 190)
  }



}

