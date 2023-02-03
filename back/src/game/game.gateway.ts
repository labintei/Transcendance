import { SubscribeMessage, WebSocketGateway, WebSocketServer , OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService , Game} from 'src/game/game.service'
import { Inject } from '@nestjs/common';
import { Match } from 'src/entities/match.entity';
import { delay } from 'rxjs';

@WebSocketGateway({
  origin: 'http://' + process.env.REACT_APP_HOSTNAME.toLowerCase() + (process.env.REACT_APP_WEBSITE_PORT=='80'?'':':' + process.env.REACT_APP_WEBSITE_PORT),
  credentials: true,
})

export class GameGateway implements OnGatewayDisconnect {

  constructor(@Inject(GameService) private gameservice: GameService) {}

  async handleDisconnect(client:Socket) {
    this.gameservice.IsinDispoDelete(client);
    this.gameservice.IsInvitDelete(client);
  }

  @SubscribeMessage('start_invit_stream')
  async stream_invit(client:Socket, d:number) {
    var data:number = Number(d);
    if(this.gameservice.Isyourgame(client, data))
    {
      var id_role = await this.gameservice.Idrole(client);
      client.emit('start', [id_role[0], id_role[1], this.gameservice.getUsernames(id_role[1])]);
      if(this.gameservice.isinvitroom(id_role[0]) === true)
        client.emit('mode', ['invitation']);
      else
        client.emit('mode', ['game']);
      this.gameservice.ClientChange(id_role, client);
      return ;
    }
    if(await this.gameservice.IsInvitation(client, data))
    {
      console.log(2);
      this.gameservice.IsinDispoDelete(client);// enleve de la liste des dispo
      this.gameservice.IsInvitDelete(client);// Se deconnecte des autres invitations
      if(this.gameservice.IsInside(client))
        return ;
      else
      {
        var bothconnect = await this.gameservice.LaunchInvitation(client, data);// si vrai lancera la game des deux cotes
        if(bothconnect[1] == true)
          this.rendergame(bothconnect[0])
      }
    }
    else
    {
      if(this.gameservice.room(data) == false) {
        const m:Match = await Match.findOneBy({id:data});
        if (m && m.status === Match.Status.ENDED)
          client.emit("Ended_game");
        else
          client.emit("Not_Exist");
        return ;
      }
      if((await this.gameservice.isBlock(client, data)))
      {
        client.emit("Blocked");
        return ;
      }
      client.emit('mode',['stream', this.gameservice.getUsernames(data)]);
      if(this.gameservice.startstream(client, data))
      {
        var render_stream;
        //client.emit('mode','stream');
        render_stream =  setInterval(() => {
          GameGateway.sendtostream(this.gameservice.getStream(data) , this.gameservice.getPos(data));
        }, 50)
      }
  }
}
  @SubscribeMessage('endgame')
  out_page(client:Socket) {
    this.gameservice.IsInvitDelete(client);
    this.gameservice.IsinDispoDelete(client);
  }

  async rendergame(data:number) {
    var room = this.gameservice.getClients(data);
    if(room[0])
    {
      room[0].emit('start', [data, 1, this.gameservice.getUsernames(data)]);
      if(this.gameservice.isinvitroom(data))
        room[0].emit('mode',['invitation']);
      else
        room[0].emit('mode', ['game']);
    }
    if(room[1])
    {
        room[1].emit('start', [data, 2, this.gameservice.getUsernames(data)]);
        if(this.gameservice.isinvitroom(data))
          room[1].emit('mode', ['invitation']);
        else
          room[1].emit('mode', ['game']);
    }
    
    delay(50);
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
        const stream:Socket[] = this.gameservice.getStream(data);
        if(stream)
          stream.map((s) => {s.emit('endstream')});
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
  async new_game(client:Socket, data:number){
    var l = await this.gameservice.newGame(client);
    this.gameservice.IsInvitDelete(client);// empeche de rentrer dans Invitation
    if(l && (l[0] && l[1] == true))
    {
      var id_role = await this.gameservice.Idrole(client);
      client.emit('start', [id_role[0], id_role[1], this.gameservice.getUsernames(id_role[0])]);
      this.gameservice.ClientChange(id_role, client);
      return ;
    }
    if(l && l[1] == true)
      return ;
    if(l && (l[0] && l[1] == false))// GAME
    {
      console.log('RENDER NUMBER ' + l[0]);
      this.rendergame(l[0]);
    }
  }

  @SubscribeMessage('left')
  async left(client: Socket, c:any){
    if(c[0] === 1)
      this.gameservice.player1x_left(c[1], client);
    if(c[0] === 2)
      this.gameservice.player2x_right(c[1], client);
  }

  @SubscribeMessage('right')
  async right(client: Socket, c:any){
    if(c[0] === 1)
      this.gameservice.player1x_right(c[1], client);
    if(c[0] === 2)
      this.gameservice.player2x_left(c[1], client);
  }

  public static async sendtostream(stream: Socket[], data:number[]){
    if(stream)
      stream.map((s) => {s.emit('newpos', data);});
	}

  @SubscribeMessage('start_stream')
  async startstream(client:Socket, data:number){
    console.log('StartStream');
    if(this.gameservice.startstream(client, data))// fct qui verifie si le stream n existe pas
    {
      var render_stream;
      render_stream =  setInterval(() => {
        GameGateway.sendtostream(this.gameservice.getStream(data) , this.gameservice.getPos(data));
      }, 160)
      this.gameservice.SetStreamRender(data, render_stream);
    }
  }

  @SubscribeMessage('endstream')
  async endstream(client:Socket, data:number){
    this.gameservice.endStream(client, data);
    client.emit("endstream");
  }

}
