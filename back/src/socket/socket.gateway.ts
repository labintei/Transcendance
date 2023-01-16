import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/game/game.service';
import { Inject } from '@nestjs/common';


import { GameService } from 'src/game/game.service';

const chanRoomPrefix = "channel_";
const pingTimeout = 60000000;//10000;//

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private static io: Server = null;
  public n:number;
  constructor(
    private gameservice: GameService
    ) {
      
  }// n utilise pas le meme game service

  afterInit(server: Server) {
    SocketGateway.io = server;
  }

  // peut prendre une liste d argument
  // async handleConnection(client: Socket, ...args: any[]){

  //}

  async handleConnection(client: Socket) {
    this.n++;
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    
    console.log('CONNECTION : ' + (client.request as any).user);
    if(user)
    {
      client.data.login = user.ft_login;
      user.socket = client.id;
      user.status = User.Status.ONLINE;
      await user.save();
      //console.log('Websocket Client Connected  ici : ' + user.ft_login);
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
      //SocketGateway.userJoinRooms(user, SocketGateway.channelsToRooms(joinedList));
    }
    client.data.pingOK = true;
    this.ping(client);
    console.log('ENDCONNECTION');

    //const c = await User.find();
    //console.log(c);
  }

  async handleDisconnect(client: Socket) {// ne doit pas etre liee au meme game service
    this.n--
    console.log('Deconnection ' + this.n);
    console.log(this.gameservice.IsinGame(client));
    this.gameservice.DisconnectionGame(client);
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    //console.log('Websocket Client Connected  ici : ' + (client.request as any).user);
    if(user)
    {
      user.socket = null;
      user.status = User.Status.OFFLINE;
      await user.save();
      console.log('Websocket Client Disconnected : ' + user.ft_login);
    }
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


  // je dois le faire ici
  public static async sendtostream(stream: Socket[], data:number[])// gameservice probleme n existe pas dans socket.gateway il faut preshot
  {
    stream.map((s) => {s.emit('pos', data);});
	}


  @SubscribeMessage('startstream')
  async startstream(client:Socket, data:number)
  {
    console.log('StartStream');
    if(this.gameservice.startstream(client, data))
    {
      // je vais creer un render
      var render_stream;
      render_stream =  setInterval(() => {
        SocketGateway.sendtostream(this.gameservice.getStream(data), this.gameservice.getPos(data));
      }, 160)
    }
    //client.emit('getlist',this.gameservice.Getlist());
  }
/*

  @SubscribeMessage('testlaulau')
  async marchepo(client:Socket)
  {
    //this.gameservice.test();
    console.log('Bien Implementer');
  }

  @SubscribeMessage('renderstream')
  async render_stream()
  {

  }


  // ca me le disconnect pour une raison obscure

  @SubscribeMessage('start_game')
  async new_game(client:Socket, data:number)
  {
    var l = await this.gameservice.newGame(client);// renvoit  une Promise
    client.emit('start', l);// renvoit le role
    if(this.gameservice.getReady(l[0]) === true)// si le game et ready et correspond a client2
    {
        var room = this.gameservice.getClients(l[0]);
        //var stream = this.gameservice.getStream(l[0]);// met a zero pour l instant
        room[0].emit('recu');
        room[1].emit('recu');

        var i = setInterval(() => {
        var a = this.gameservice.sphereroom(l[0]);

        if(room[0] != null)
            room[0].emit('newpos', a);
        if(room[1] != null)
          room[1].emit('newpos', a);
       }, 100);
       
       var time = 0;
       var score = [0,0];
       var j = setInterval(() => {
        console.log(this.gameservice.IsInside(client));

        var newscore = this.gameservice.getScore(l[0]);
        if(score != newscore)
        {
          room[0].emit('score', newscore);
          room[1].emit('score', newscore);
        }
        if(room[0] != null)
          room[0].emit('time', time);
        if(room[1] != null)
          room[1].emit('time', time);
        time++;
      }, 1000);
      //
      this.gameservice.SetTimer(l[0],j);
      this.gameservice.SetRender(l[0],i);
      //this.gameservice.GetStream().emit;
    }
  }

  @SubscribeMessage('endgame')
  async endgame(client:Socket, data:number)
  {
    console.log('SOCKET SERVER ON ENDGAME : ' +  this.gameservice.IsinGame(client));
    this.gameservice.DisconnectionGame(client);
  }


  @SubscribeMessage('left')
  async left(client: Socket, c:any)//: Promise<number>
  {
    if(c[0] === 1)// si le role correspond a 1
      this.gameservice.player1x_right(c[1]);
    if(c[0] === 2)
      this.gameservice.player2x_left(c[1]);
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
    if(c[0] === 1)
      this.gameservice.player1x_left(c[1]);
    if(c[0] === 2)
      this.gameservice.player2x_right(c[1]);
  }


  @SubscribeMessage('verif')
  async verif(client:Socket, data:any)
  {
  }

  @SubscribeMessage('getlist')
  async getlist(client:Socket)
  {
    client.emit('getlist', this.gameservice.Getlist());
  }



  @SubscribeMessage('useremit')
  async useremit(client:Socket, user:string)
  {
    // je vais faire une liste de User
    var c = await User.find();
    console.log(c);
    console.log('HEAR USEREMIT');
    console.log('USER ' + user);

    //const user = await User.findOneBy({ft_login: (client.request as any).user});

    const l = await  User.findOneBy({ft_login: user})

    if(l)
    {
      console.log('ID client ' + client.id);
      l.socket = client.id;
    }
    console.log(l.socket);// id est bien associe au user

  }

*/  
}
