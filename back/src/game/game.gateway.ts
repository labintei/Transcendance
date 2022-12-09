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

  @WebSocketServer() private io: Server;

  constructor(
    //private gameservice: GameService,
    //private appGateway: SocketGateway,
    /*@Inject(GameService) */private gameservice: GameService
    ) {}

  //constructor(@Inject(GameService) private gameService: GameService) {}

  async error(client: Socket, msg: string = ''): Promise<any> {
    await client.emit('error', msg);
    return null;
  }

/*
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
    //if(await(c[0] === 1))
    console.log('Before ' + String(this.gameservice.getBox1(c[1])))
    var num = await this.gameservice.player1x_left(c[1]);
    var numbis = await (num/10);
    console.log('Renvoye L' + String(num))
    console.log('Numbis ' + String(numbis));
    client.emit('box1_x', numbis);
    //else
      //client.emit('box2_x', this.gameservice.player2x_left(c[1]));
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
    //if(await(c[0] === 1))
    //{
      console.log('Before ' + String(this.gameservice.getBox1(c[1])))
      var num = await this.gameservice.player1x_right(c[1]);
      var numbis = await (num/10);
      console.log('Renvoye  R' + String(num));
      console.log('Numbis ' + String(numbis));
      client.emit('box1_x', numbis);
    //}
    //else
      //client.emit('box_2', this.gameservice.player2x_right(c[1]));
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
*/ 
}
