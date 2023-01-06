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

  // peut prendre une liste d argument
  // async handleConnection(client: Socket, ...args: any[]){

  //}

  async handleConnection(client: Socket) {
    //console.log('correspond a ' + (client.request as any).user);
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    client.data.login = user.ft_login;
		// sinon disconnect le player1
    //await SocketGateway.userDisconnect(user);
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
    // ne cherche pas le bon login de base
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

  // ca me le disconnect pour une raison obscure

  @SubscribeMessage('start_game')
  async new_game(client:Socket, data:number)
  {
    console.log('Liste User');
    console.log(await User.find());
    var l = await this.gameservice.newGame(client);// renvoit  une Promise
    console.log('room id et role ');
    console.log(l);
    console.log(l[0]);
    console.log(l[1]);
    console.log('On a donc l user ' + (client.request as any).user);
    console.log('end');
    client.emit('start', l);
    if(this.gameservice.getReady(l[0]) === true)// si le game et ready et correspond a client2
    {    
        console.log('Launch game')// ne correspond pas a data
        var room = this.gameservice.getClients(l[0]);
        room[0].emit('recu');
        room[1].emit('recu');

        var i = setInterval(() => {
        var a = this.gameservice.sphereroom(l[0]);
        console.log('Envoye ' + a);
        var posBox1 = this.gameservice.getBox1(l[0]);
        var posBox2 = this.gameservice.getBox2(l[0]);
        if(room[0] != null)
        {
            room[0].emit('box1_x', posBox1);
            room[0].emit('box2_x', posBox2);
            room[0].emit('newpos', a);
        }
        if(room[1] != null)
        {
          room[1].emit('box1_x', posBox1);
          room[1].emit('box2_x', posBox2);
          room[1].emit('newpos', a);
        }

       }, 190)
    }
  }


  @SubscribeMessage('left')
  async left(client: Socket, c:any)//: Promise<number>
  {
    if(c[0] === 1)// si le role correspond a 1
      this.gameservice.player1x_left(c[1]);
    if(c[0] === 2)
      this.gameservice.player2x_left(c[1]);
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
    if(c[0] === 1)
      this.gameservice.player1x_right(c[1]);
    if(c[0] === 2)
      this.gameservice.player2x_right(c[1]);
  }

  // ne devra peut etre pas etre lancer cotee cotee front mais plutot cote front


  @SubscribeMessage('ball')
  async sphere(client: Socket, data:number)
  {
    console.log('Once');
    var room = this.gameservice.getClients(data);
    var i = setInterval(() => {

      var a = this.gameservice.sphereroom(data);
      var posBox1:number = (this.gameservice.getBox1(data));
      var posBox2:number = (this.gameservice.getBox2(data));

        room[0].emit('box1_x', posBox1);
        room[0].emit('box2_x', posBox2);
        room[0].emit('newpos', a);

        room[1].emit('box1_x', posBox1);
        room[1].emit('box2_x', posBox2);
        room[1].emit('newpos', a);
      /*
      client.emit('box1_x', posBox1);
      client.emit('newpos', a);*/
    }, 190)
  }



}

