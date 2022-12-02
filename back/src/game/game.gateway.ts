import { MESSAGES } from '@nestjs/core/constants';
import { MessageBody, ConnectedSocket, OnGatewayInit ,OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway,WsException, WebSocketServer , } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService , Game} from 'src/game/game.service'
import {Match} from 'src/entities/match.entity';
import {User} from 'src/entities/user.entity';
//import {Room} from 'src/game/room.interface'
import { Inject } from '@nestjs/common';
import { async } from 'rxjs';



WebSocketGateway()
export class GameGateway {

  @WebSocketServer() private io: Server;

  async error(client: Socket, msg: string = ''): Promise<any> {
    await client.emit('error', msg);
    return null;
  }


  //socket.on('player1_move', (data) => { useStore((state:any) => state.player1Move(data))});

  @SubscribeMessage('left')
  async left(client: Socket, data: number)//: Promise<number>
  {
    const user = await User.findOneBy({ft_login: (client.request as any).user});
    console.log("data recu : ");
    console.log(data);
    await (data -= 0.2);
    await client.emit('player1_move', data);
    await console.log("data renvoyer : ");
    await console.log(data);
    client.emit('player1_move', data);
    
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
    console.log(data);
    await (data += 0.2);
    //return data;
    // a voir
    return client.emit('player1_move', data);
    //return SocketGateway.getIO().in(user.socket).emit('player1_move', data);
    //await client.emit('player1_move', data);
  }


  @SubscribeMessage('end_right')
  async end_right(client: Socket)
  {
    //console.log('endright');
  }

	@SubscribeMessage('pong')
	async pong(client: Socket) {
		client.data.pingOK = true;
	}

  @SubscribeMessage('game')
  async game(client: Socket){
  

  console.log("recu back'");
  this.io.emit('wait_game');
  
  } 
}






/*
@WebSocketGateway()
export class GameGateway {

  constructor(
    @Inject(GameService) private gameserv: GameService    
  ){}

  @WebSocketServer() private io: Server;


  async error(client: Socket, msg: string = ''): Promise<any> {
    await client.emit('error', msg);
    return null;
  }

    @SubscribeMessage('pong')
    async handleStart(@ConnectedSocket() client: Socket)
    {
      console.log("recu cote back");
      this.io.emit('ping');
    }
  

}


// Bpn pn va decouper la reflexons avec deux trucx differents

/*
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
    console.log('Websocket Client Connected : ' + user.ft_login);// ok je rentre obligatoirement ici
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

	@SubscribeMessage('pong')
	async pong(client: Socket) {
		client.data.pingOK = true;
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

}*/