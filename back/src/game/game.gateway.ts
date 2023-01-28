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

export class GameGateway implements OnGatewayDisconnect {
/*
  constructor(
    private gameservice: GameService
    ) {}*/

  constructor(@Inject(GameService) private gameservice: GameService) {}


  async handleDisconnect(client:Socket)// n empiete pas sur la deconnection de base
  {
    console.log('DISCONNECTION GAME GATEWAY');
    console.log(this.gameservice.IsinDispoDelete(client));
    //console.log(this.gameservice.IsinGame(client));
    //this.gameservice.DisconnectionGame(client);
  }
  
  // Le cas ou tu as a la fois une invitation et un matching 
  // On part du principe que on peut pas demarrer ni l un ni l autre si deja en train de jouer
  //socket.emit('start_invit_stream');
  // probleme tu peut pas a la fois etre invite et regarder ton propre stream
  @SubscribeMessage('start_invit_stream')
  async stream_invit(client:Socket, data:number)
  {
    console.log('client ' + client + ' data ' + data);
    if(await this.gameservice.IsInvitation(client, data))// si c est une invitation
    {
      console.log('IS INVITATION');
      if(this.gameservice.IsInside(client))// si il est daje en train de jouer
      {
        console.log('probleme ici');
        return ;// n implemente pas et attends qu il reload ca page pour le mettre dans la room
      }
      else// launch la game et wait le deuxieme participant
      {
        var bothconnect = await this.gameservice.LaunchInvitation(client, data);// si vrai lancera la game des deux cotes
        if(bothconnect[1] == true)
        {
          this.rendergame(bothconnect[0])
        }
      }
    }
    else // n est pas une invitation
    {
      console.log('IS STREAM');
      console.log(await this.gameservice.getRoom(data));

      if(!(this.gameservice.getRoom(data)))
      {
        console.log('ROOM EXISTE PAS');
        //return ;// la room n existe pas
      }
      if(this.gameservice.startstream(client, data))// fct qui verifie si le stream n existe pas
      {
        var render_stream;
        render_stream =  setInterval(() => {
          GameGateway.sendtostream(this.gameservice.getStream(data), this.gameservice.getPos(data));
        }, 160)
      }
    }

  }



  @SubscribeMessage('endgame')
  out_page(client:Socket)
  {
    console.log("TU AS QUUITTER LA PAGE");
    console.log(this.gameservice.IsinDispoDelete(client));
  }

  @SubscribeMessage('testlaulau')
  async marchepo(client:Socket)
  {
  }

  @SubscribeMessage('renderstream')
  async render_stream()
  {

  }

  //public static async
  async rendergame(data:number)
  {
    var room = this.gameservice.getClients(data);
    if(room[0])
      room[0].emit('start', [data, 1]);
    if(room[1])
      room[1].emit('start', [data, 2]);
    
    console.log(data);
    var i = setInterval(() => {
      var clients = this.gameservice.getClients(data);
      var a = this.gameservice.sphereroom(data);
      if(clients[0] != null)
          clients[0].emit('newpos', a);
      if(clients[1] != null)
          clients[1].emit('newpos', a);
     }, 50);
     
     var time = 0;
     var score = [0,0];
     var j = setInterval(() => {
      if(this.gameservice.isFinish(data))
      {
        var clients = this.gameservice.getClients(data);
        if(clients[0])
          clients[0].emit('endgame');
        if(clients[1])
          clients[1].emit('endgame');
        this.gameservice.CreateMatchID(data);
        this.gameservice.DisconnectionGameId(data);
      }
      else
        this.gameservice.addtime(data)
    }, 1000);
    this.gameservice.SetTimer(data,j);
    this.gameservice.SetRender(data,i);
  }



  @SubscribeMessage('start_game')
  async new_game(client:Socket, data:number)
  {
    var l = await this.gameservice.newGame(client);// renvoit room-id et true replace ou pas
    if(l && (l[0] && l[1] == true))
    {
      console.log('reconnection a la game');
      var id_role = await this.gameservice.Idrole(client);
      client.emit('start', id_role);
      //await this.gameservice.delay(50);
      this.gameservice.ClientChange(id_role, client);
      return ;
    }
    if(l && l[1] == true)
      return ;
    if(l && (l[0] && l[1] == false))// GAME
    {
      this.rendergame(l[0]);
      /*
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
      return ;*/
    }
  }

  @SubscribeMessage('endgame')
  async endgame(client:Socket, data:number)
  {
    console.log('END GAME NOT DISCONNECT')
    //this.gameservice.DisconnectionGame(client);
  }


  @SubscribeMessage('left')
  async left(client: Socket, c:any)//: Promise<number>id-room role 1 ou deux
  {
    if(c[0] === 1)// si le role correspond a 1
      this.gameservice.player1x_left(c[1], client);
    if(c[0] === 2)
      this.gameservice.player2x_right(c[1], client);
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any)//: Promise<number>
  {
    if(c[0] === 1)
      this.gameservice.player1x_right(c[1], client);
    if(c[0] === 2)
      this.gameservice.player2x_left(c[1], client);
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
    //const user = await User.findOneBy({ft_login: (client.request as any).user});

    const l = await  User.findOneBy({ft_login: user})

    if(l)
    {
      l.socket = client.id;
    }
  }

  public static async sendtostream(stream: Socket[], data:number[])// gameservice probleme n existe pas dans socket.gateway il faut preshot
  {
    stream.map((s) => {s.emit('pos', data);});
	}

  @SubscribeMessage('start_stream')
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
