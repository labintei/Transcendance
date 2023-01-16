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
import { getCustomRepositoryToken } from '@nestjs/typeorm';
// a enlever


@WebSocketGateway({
  origin: 'http://' + process.env.REACT_APP_HOSTNAME.toLowerCase() + (process.env.REACT_APP_WEBSITE_PORT=='80'?'':':' + process.env.REACT_APP_WEBSITE_PORT),
  credentials: true,
})

export class GameGateway{

  constructor(
    private gameservice: GameService
    ) {}

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
        //console.log(this.gameservice.IsInside(client));

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


}
