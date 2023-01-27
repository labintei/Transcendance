import { SubscribeMessage, WebSocketGateway, WebSocketServer , OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService , Game} from 'src/game/game.service'
import {Match} from 'src/entities/match.entity';
import {User} from 'src/entities/user.entity';
//import {Room} from 'src/game/room.interface'
import { Inject } from '@nestjs/common';
import { async, subscribeOn } from 'rxjs';
// A enlever
import { SocketGateway } from 'src/socket/socket.gateway';
import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { threadId } from 'worker_threads';
// a enlever


@WebSocketGateway({
  origin: 'http://' + process.env.REACT_APP_HOSTNAME.toLowerCase() + (process.env.REACT_APP_WEBSITE_PORT=='80'?'':':' + process.env.REACT_APP_WEBSITE_PORT),
  credentials: true,
})

export class GameGateway/* implements OnGatewayDisconnect */{
/*
  constructor(
    private gameservice: GameService
    ) {}*/

  constructor(@Inject(GameService) private gameservice: GameService) {}

/*
  async handleDisconnect(client:Socket)
  {
    console.log('DISCONNECTION GAME GATEWAY');
    console.log(this.gameservice.IsinGame(client));
    this.gameservice.DisconnectionGame(client);
  }*/


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

  @SubscribeMessage('start_game')
  async new_game(client:Socket, data:number)
  {
    var l = await this.gameservice.newGame(client);// renvoit room-id et true replace ou pas
    if(l && (l[0] && l[1] == true))
    {
      console.log('reconnection a la game');
      var id_role = await this.gameservice.Idrole(client);
      client.emit('start', id_role);// j avais rajoute une [] dessus ce qui faisait un tableau de tableau
      await this.gameservice.delay(4000);
      this.gameservice.ClientChange(id_role, client);
      return ;
    }
    if(l && l[1] == true)
      return ;
    if(l && (l[0] && l[1] == false))
    {
        var room = this.gameservice.getClients(l[0]);
        if(room[0])
          room[0].emit('start', [l[0],1]);
        if(room[1])
          room[1].emit('start', [l[0],2]);
        var i = setInterval(() => {
        var clients = this.gameservice.getClients(l[0]);
        var a = this.gameservice.sphereroom(l[0]);
        if(clients[0] != null)
            clients[0].emit('newpos', a);
        if(clients[1] != null)
            clients[1].emit('newpos', a);
       }, 50);
       
       var time = 0;
       var score = [0,0];
       var j = setInterval(() => {
        if(this.gameservice.isFinish(l[0]))
        {
          var clients = this.gameservice.getClients(l[0]);
          if(clients[0])
            clients[0].emit('endgame');
          if(clients[1])
            clients[1].emit('endgame');
          this.gameservice.CreateMatchID(l[0]);
          this.gameservice.DisconnectionGameId(l[0]);
        }
        else
          this.gameservice.addtime(l[0])
      }, 1000);
      this.gameservice.SetTimer(l[0],j);
      this.gameservice.SetRender(l[0],i);
      return ;
    }
  }

  @SubscribeMessage('endgame')
  async endgame(client:Socket, data:number)
  {
    //console.log(this.gameservice.IsinGame(client));
    console.log('SOCKET SERVER ON ENDGAME : ' +  this.gameservice.IsinGame(client));
    this.gameservice.DisconnectionGame(client);
  }


  @SubscribeMessage('left')
  async left(client: Socket, c:any)//: Promise<number>id-room role 1 ou deux
  {
    if(c[0] === 1)// si le role correspond a 1
      this.gameservice.player1x_left(c[1]);
    if(c[0] === 2)
      this.gameservice.player2x_right(c[1]);
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
    if(c[0] === 1)
      this.gameservice.player1x_right(c[1]);
    if(c[0] === 2)
      this.gameservice.player2x_left(c[1]);
  }


  @SubscribeMessage('verif')
  async verif(client:Socket, data:any)
  {
  }

  @SubscribeMessage('getlist')
  async getlist(client:Socket)
  {
    var j = await this.gameservice.Getlist();
    client.emit('getlist', j);
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

  public static async sendtostream(stream: Socket[], data:number[])// gameservice probleme n existe pas dans socket.gateway il faut preshot
  {
    stream.map((s) => {s.emit('pos', data);});
	}

  @SubscribeMessage('startstream')
  async startstream(client:Socket, data:number)
  {
    console.log('StartStream');
    if(this.gameservice.startstream(client, data))// fct qui verifie si le stream n existe pas
    {
      var render_stream;
      render_stream =  setInterval(() => {
        GameGateway.sendtostream(this.gameservice.getStream(data), this.gameservice.getPos(data));
      }, 160)
    }
  }

  @SubscribeMessage('endstream')
  async endstream(client:Socket, data:number)
  {
    this.gameservice.endStream(client, data);
  }

}
