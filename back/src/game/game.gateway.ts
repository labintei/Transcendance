import { MESSAGES } from '@nestjs/core/constants';
import { MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService , Game} from 'src/game/game.service'
import {Match} from 'src/entities/match.entity';
//import {Room} from 'src/game/room.interface'
import { Inject } from '@nestjs/common';
import { async } from 'rxjs';




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

  /*
  @SubscribeMessage('test')
  async test(client: Socket): Promise<any> 
  {
      console.log('connection back');
      this.io.in(client).emit('hey');

  }*/

  /*
  @SubscribeMessage('connection')
  async starteuh(@ConnectedSocket() client: Socket)
  {
      this.io.emit('hello');
      console.log("recu au back");
      //this.gameserv.('connected',{ok:"ok"});
  }*/

  
    @SubscribeMessage('pong')
    async handleStart(@ConnectedSocket() client: Socket)
    {
      console.log("recu cote back");
      this.io.emit('ping');
    }
  
    // Joindre la room
  
  /*  @SubscribeMessage('join')
    async joinroom(
        @MessageBody('room') roomid : number,
        @ConnectedSocket() client: Socket,
    ): Promise<boolean>{
      return false;
    }
  */

    // Unjoin la room
  /*  @SubscribeMessage('unjoin')
    async unjoinroom(
      @MessageBody('room') roomid : number,
      @ConnectedSocket() client : Socket,
    ): Promise<boolean>
    {
      return true;
    }

    @SubscribeMessage('move')
    move(
      @MessageBody('room') roomid: number,
      @MessageBody('player') playerId: number,// 1 ou 2
      @MessageBody('dir') dir: number,
    )
    {
        //return false;
    }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }*/

}
