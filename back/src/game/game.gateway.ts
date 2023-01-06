import { MESSAGES } from '@nestjs/core/constants';
import { MessageBody, ConnectedSocket, OnGatewayInit ,OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway,WsException, WebSocketServer , } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService , Game} from 'src/game/game.service'
import {Match} from 'src/entities/match.entity';
import {User} from 'src/entities/user.entity';
//import {Room} from 'src/game/room.interface'
import { Inject } from '@nestjs/common';
import { async } from 'rxjs';
// A enlever
import { SocketGateway } from 'src/socket/socket.gateway';
// a enlever


@WebSocketGateway({
  origin: 'http://' + process.env.REACT_APP_HOSTNAME.toLowerCase() + (process.env.REACT_APP_WEBSITE_PORT=='80'?'':':' + process.env.REACT_APP_WEBSITE_PORT),
  credentials: true,
})
export class GameGateway{
/*
  constructor(
    private gameservice: GameService
    ) {}*/
/*
  @SubscribeMessage('start_game')
  async new_game(client:Socket, data:number)
  {
    var l = await this.gameservice.newGame(client);
    client.emit('start', l);
    if(this.gameservice.getReady(l[0]) === true)
    {    
        console.log('Launch game')
        var room = this.gameservice.getClients(l[0]);
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
       var j = setInterval(() => {
        if(room[0] != null)
          room[0].emit('time', time);
        if(room[1] != null)
          room[1].emit('time', time);
        time++;
      }, 1000);

      this.gameservice.SetTimer(l[0],j);
      this.gameservice.SetRender(l[0],i);
      // je doit faire des clear Interval ici
    }
  }

  @SubscribeMessage('end_game')
  async endgame(client:Socket, data:number)
  {
    console.log('END GAME');
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
  */
}
