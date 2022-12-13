import { Injectable , OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
//import { Room } from 'src/game/room.interface';
import { Socket} from "socket.io";
import session from "express-session";
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';


import { match } from "assert";
import { find } from "rxjs";
import { getManager } from "typeorm";


// public io: Server = null
//    this.


export class Game {
    public id: number;
    public room_id: number;
    public nb_player: number;
    public score1: number;
    public score2: number;
    public player1: Socket;
    public player2: Socket;
    public player1_x: number;
    public player2_x: number;
    public Box1x: number;
    public Box2x: number;

    // ne veut pas utiliser cette chose 
    public sx: number;
    public sz: number;
    public zdir: number;
    public xangle: number;

    //Box1_left: () => number;
    //Box1_right: () => number;
    //Setbox1x(num: number): void;

    //setBox1x(num:number): number{return (this.Box1x + 0,2);}
    // mettre toutes les donnees necessaire
}

@Injectable()
export class GameService {
 

    // Liste de Game
    public s: Map<number, Game>;
    // Liste de Game dispo (dispo et number) // une liste de room id sera suffisant
    public dispo:  Set<number>;
    //public dispo: Map<number, number>;
    constructor(){
        this.s = new Map();
        this.dispo = new Set()
    }

    // probleme peut pas faire les emit ici


    async getroom(id:number): Promise<Game>
    {return this.s.get(id);}

    async sphere(room:Game): Promise<Number[]>
    {
        console.log("SPHERE")
      var width = 2;

      var sz = room.sz;
      var sx = room.sx;

      var b1x = room.Box1x  / 10;
      var b2x = room.Box2x / 10;
      
      room.sz += room.zdir;
      room.sx += room.xangle;

      var x = room.sx;
      var y = room.sz;
      //client.emit('newpos', [x, this.s.get(id).sz]);


        // deceleration
      if (room.zdir > 0.1)
        room.zdir -= 0.005
      else (room.zdir < (-0.1))
        room.zdir += 0.005;
  
      if(sz === (5 - 1) &&
        sx >= (b1x - width) && 
        sx <= (b1x + width))
        room.zdir = -0.3;
      else(sz === -5 && 
        sx >= (b2x - width) &&
        sx <= (b2x + width))
        room.zdir = +0.3;
        // ne doit pas update dir ici
      //client.emit('updatez_dir', tzdir);
      
      // colision avec les bords
      if(sx === -5 || sx === 5)
      {
        console.log("colision");
        room.xangle *= -1;
      }
      if (sz > 7)
      {
        console.log("RESET");
        //client.emit('add1'); 
        //client.emit('reset');
        return [0,0];
        //client.emit('newpos', [0,0]);
      }
      else if(sz < -7)
      {
        console.log("RESET");
        //client.emit('add2');
        //client.emit('newpos', [0,0]);
        return [0,0];
        }
        return [x,y];

      //client.emit('ready');
    }
    


    // aimerais rajouter le statut dans Map
    // j aimerais a la fois pouvoir le trouver avec 
    //id:status:Game
    //public sbis: Map<{number, {Game, number}} 


    // set(ajoute)get(find)has(bool)size(nombre:game)delete(key)clear()
    // fait une liste des joueurs en jeu (est ce vraiment necessaire)

    // les questions que je me pose c est qu il faudrait pas que
    // partie soit deja prise alors que la fonction est en cour
    async newGame(client:Socket): Promise<number[]>
    {
        console.log('START');
        /*
        if(this.dispo.size === 0)// aucune room dispo
        {*/
            //const us = User.findOneBy({ft_login: (client.request as any).user});
            
            
            
            const m = new Match();
            
            m.score1 = 0;
            m.score2 = 0;
            m.user1 = await User.findOneBy({ft_login: (client.request as any).user});
            await m.save();
            var room: Game = {
            id: m.id,
            room_id: this.s.size,
            nb_player: 1,
            score1: 0,
            score2: 0,
            player1: client,
            player2: null,
            player1_x: 1,
            player2_x: 2,
            Box1x:0,
            Box2x:0,
            
            sx: 0,
            sz: 0,
            zdir: 0.05,
            xangle: 0,
            }
            var l = Math.random();
            if (l < 0.5)
              room.zdir = -0.05;
            room.xangle = l *0.1;

            var l = this.s.size;
            this.s.set(l , room);// permet de reconnaitre la room a l id
            this.dispo.add(room.id);
            const s = [l, 1];
            return s;
            //client.emit('start', s);
            // renvoit le role et l id de la room
        //}
        /*else
        {
            const m:Game = this.s.get(this.dispo[0]);
            m.player2 = client;
            m.nb_player = 2;
            this.dispo.delete(this.dispo[0]);

        }*/

    }

/*
    get(id): Game
    {
        return this.s.find(id);
    }*/

    player1x_right(id:number): number
    {
        this.s.get(id).Box1x -= 2;
        return this.s.get(id).Box1x;
    }

    player1x_left(id:number): number
    {
        this.s.get(id).Box1x += 2;
        return this.s.get(id).Box1x;
    }


    getBox1(id:number): number
    {
        var d = this.s.get(id)
        var num = d.Box1x;
        return num;
    }

    async player2x_right(id:number) : Promise<number>
    {
        return this.s.get(id).Box2x += 0.2;
        //return 0;
    }

    async player2x_left(id:number) : Promise<number>
    {
        return this.s.get(id).Box2x -= 0.2;
        //return 0;
    }

    test()
    {
        console.log('ok');
    }

    


    async endGame(client: Socket, id: number)// je ne sait pas si j implemente directement le score a la fin ou pendant
    {
        const m:Game = this.s.get(id);
        const match = await Match.findOneBy({id: id});
        if(m.nb_player === 1)// si il n y a pas eu de match 
        {
            match.remove(); // l effacera peut etre tout seule
            //match = find
            // efface des dispo et efface le match history associes
            this.dispo.delete(id);
        }
        this.s.delete(id);
    }

    async findRoom(id:number)
    {
        this.s.get(id);
    }


    initBall(roomId: number ) {
        // declare une nouvelle variable
        //const r = GameService.rooms.find((room) => room.id === roomId);// trouve r
        //r.ballx = 42
    }

    updateBall(roomId: number) {

    }

}