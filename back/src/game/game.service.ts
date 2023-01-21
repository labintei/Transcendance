import { Injectable , OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
//import { Room } from 'src/game/room.interface';
import { Socket} from "socket.io";
import session from "express-session";
import { Match } from 'src/entities/match.entity';
import { User, UserStatus } from 'src/entities/user.entity';// j exporte l enum


import { match } from "assert";
import { find } from "rxjs";
import { getManager, NoVersionOrUpdateDateColumnError } from "typeorm";
import { SqljsEntityManager } from "typeorm/entity-manager/SqljsEntityManager";


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

    // ???
    
    public sx: number;
    public sz: number;
    public zdir: number;
    public xangle: number;

    public time: number;

    public ready: boolean;

    public timer: any;
    public render: any;

    //Box1_left: () => number;
    //Box1_right: () => number;
    //Setbox1x(num: number): void;

    //setBox1x(num:number): number{return (this.Box1x + 0,2);}
    // mettre toutes les donnees necessaire
}

@Injectable()
export class GameService {
 
    public stream: Map<number, Array<Socket>>;
    public s: Map<number, Game>;
    public invit: Map<number, Game>;
    public dispo:  Set<number>;

    constructor(){
        this.stream = new Map();
        this.s = new Map();
        this.dispo = new Set()
        //this.dispo = new Array();
    }


    isFinish(data:number)
    {
        if(this.s.get(data).score1 >= 5 || this.s.get(data).score2 >= 5)
            return true;
        return false;
    }

    async Getlist(): Promise<Array<[number,string,string]>>
    {
        let list: Array<[number,string,string]> = [];
        if(this.s)
        {
            for(var [key, value] of this.s.entries())
            {
                if(value)
                {
                    if(value.ready === true)
                    {
                        var ft_login;
                        var ft_login2;
                      ft_login = await User.findOneBy({socket: value.player1.id});
                      ft_login2 = await User.findOneBy({socket: value.player2.id});
                      
                        if(!ft_login)
                            ft_login = 'visitor';
                        if(!ft_login2)
                            ft_login2 = 'visitor';
                      list.push([key, ft_login, ft_login2]);
                     }
                }
            }
        }
        return list
    }

    DisconnectionGameId(id:number)
    {
        var room = this.s.get(id);
        if(room)
        {
            clearInterval(room.render);
            clearInterval(room.timer);
            var id = room.room_id;
            this.dispo.delete(id);
            this.s.delete(id);
        }
    }

    DisconnectionGame(client:Socket): Socket[]// renvoit les deux clients
    {
        console.log('DISCONNECTION GAME');
        for(var [key, value] of this.s.entries())
        {
            console.log(key);
            console.log(value);
            if(value)
            {
                if(value.player1 == client ||
                    value.player2 == client)
                {
                    var clients = [value.player1,value.player2];
                    console.log('EST BIEN DANS GAME');
                    clearInterval(value.render);
                    clearInterval(value.timer);
                    var id = value.room_id;
                    this.dispo.delete(id);
                    this.s.delete(id);
                    return clients;
                }
            }
        }
        return [null,null];
    }

    IsInside(client:Socket)
    {
        for(var [key, value] of this.s.entries())
        {
            if(value)
            {
                if(value.player1 == client ||
                    value.player2 == client)
                {
                    console.log('EST BIEN DANS GAME');
                    return true;
                }
            }
        }
        return false;       

    }

    IsinGame(client:Socket)
    {
        console.log('End Game');
        console.log(this.s);// pourquoi map{0} ici
        console.log(Object.entries(this.s));
        
        for(var [key, value] of this.s.entries())
        {
            if(value)
            {
                if(value.player1 == client ||
                    value.player2 == client)
                {
                    console.log('EST BIEN DANS GAME');
                    clearInterval(value.render);
                    clearInterval(value.timer);
                    var id = value.room_id;
                    this.dispo.delete(id);
                    this.s.delete(id);
                    return true;
                }
            }
        }
        return false;
    }



    sphereroom(id:number): number[]
    {
        if(!this.s.get(id))
        {
            console.log('N EXISTE PAS');
            return [0,0];
        }
        var g = this.sphere(this.s.get(id));
        return g;
    }

    getScore(data:number)
    {
        var room = this.s.get(data);
        if(room)
            return [room.score1,room.score2];
        return [0,0];
    }

    getPos(data:number): number[]
    {
        var room = this.s.get(data);
        if(room)
            return [Number(room.sx.toFixed(3)),Number(room.sz.toFixed(3)), Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1))];
        return ([0,0,0,0,0,0,0])// valeur par default tout a 0
    }

    sphere(room:Game): number[]
    {
        var width = 1;

        var sz = Math.floor(room.sz);
        var sx = Math.round(room.sx * 10) / 100;
        var b2x = Math.round(room.Box2x * 10) / 100;
        var b1x = Math.round(room.Box1x * 10) / 100;

        room.sx += room.zdir;
        room.sz += room.zdir;

      if(room.zdir > 0.1)
        room.zdir -= 0.005;
      if(room.zdir < (-0.1))
        room.zdir += 0.005;

    if(sz === (4) &&
    ((sx >= (b1x - 0.8)) && 
    (sx <= (b1x + 1.8))))
    {
        console.log('collision');
        room.zdir = -0.3;
    }  
    if(sz === (-5) && 
        ((sx >= (b2x - 1.8)) &&
        (sx <= (b2x + 0.8))))
    {
        console.log('collision');
        room.zdir = 0.3;
    }
    
    var sxint = Math.round(room.sx);
      if(sx === -5 || sx === 5)
        room.xangle *= -1;
      if (sz > 7 || sz < -7)
      {
        if(sz > 7)
            room.score2++;
        if(sz < -7)
            room.score1++;
        console.log('Score 1 : ' + room.score1 + ' Score 2 : ' + room.score2);
        room.sx = 0;
        room.sz = 0;
        var l = Math.random();
        var side = Math.random();
        console.log(l);
        if (l < 0.5)
          room.zdir = -0.05;
        room.xangle = l * 0.1;
        if(side < 0.5)
            room.xangle *= -1;
        console.log(room.xangle.toFixed(3));
        return [0,0, Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1)), room.time, room.score1, room.score2];
      }   
    return [Number(room.sx.toFixed(3)),Number(room.sz.toFixed(3)), Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1)), room.time, room.score1, room.score2];
}
    /*
    enum UserStatus {
     ONLINE = "Online",
     OFFLINE = "Offline",
     MATCHING = "Matching",
     PLAYING = "Playing",
     BANNED = "Banned"
    }*/


    async newGame(client:Socket): Promise<number[]>
    {
        console.log('START');
        
        if(this.dispo.size === 0)// aucune room dispo
        {
            // PAS CREER LE MATCH ICI
            var room: Game = {
            id: 0,
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
            time : 0,
            ready: false,
            timer : null,
            render : null,
            }
            var l = Math.random();    
            const u = await User.findOneBy({socket: client.id});
            if(u)
                u.status = UserStatus.MATCHING;// en train de matcher
            if (l < 0.5)
              room.zdir = -0.05;
            room.xangle = l * 0.5;
            var l = this.s.size;
            // set en dispo et creer la room
            this.s.set(l , room);
            this.dispo.add(l);
            const s = [l, 1];
            return s;
        }
        else
        {           
            console.log(this.dispo);
            var iterator = this.dispo.values();
            var value = iterator.next().value;
            var room = this.s.get(value);
            if(room)// creer un cas d errur
            {
                room.ready = true;
                room.player2 = client;

                var u1 = await User.findOneBy({socket: room.player1.id});// cherche user1
                var u2 = await User.findOneBy({socket: room.player2.id});// cherche user2
                u1 ? u1.status = UserStatus.PLAYING : u1;
                u2 ? u2.status = UserStatus.PLAYING : u2;
                this.dispo.delete(value);
                return [room.room_id, 2];
            }
            return [0,0];
        }

    }

    getReady(id:number): boolean
    {
        if(this.s.get(id))
            return this.s.get(id).ready;
        return false;
    }


/*
    get(id): Game
    {
        return this.s.find(id);
    }*/


    addtime(data:number)
    {
        var room = this.s.get(data);
        if(room)
            room.time= room.time + 1;
    }


    player2x_right(id:number)
    {
        this.s.get(id).Box2x += 0.6;
    }

    player2x_left(id:number)
    {
        this.s.get(id).Box2x -= 0.6;
    }

    player1x_right(id:number)
    {
        this.s.get(id).Box1x -= 0.6;
    }

    player1x_left(id:number)
    {
        this.s.get(id).Box1x += 0.6;
    }

    getRender(id:number):any
    {
        if(this.s.get(id))
            return this.s.get(id).render;
        return null;
    }

    getTimer(id:number):any
    {
        if(this.s.get(id))
            return this.s.get(id).timer;
        return null;
    }

    SetRender(id:number, render:any)
    {
        if(this.s.get(id))
            return this.s.get(id).render = render;
    }

    SetTimer(id:number, timer:any )
    {
        if(this.s.get(id))
            return this.s.get(id).timer = timer;
    }

    getBox1(id:number): number
    {
        if(this.s.get(id))
            return (Number(this.s.get(id).Box1x.toFixed(1)));
        return 0;
    }

    getBox2(id:number): number
    {
        if(this.s.get(id))
        {
            //console.log(this.s.get(id).Box2x)
            //return this.s.get(id).Box2x;
            return (Number(this.s.get(id).Box2x.toFixed(1)));
        }
        return 0;
    }



    async endGame(client: Socket, id: number)// je ne sait pas si j implemente directement le score a la fin ou pendant
    {
        const m:Game = this.s.get(id);
        const match = await Match.findOneBy({id: id});
        if(m.nb_player === 1)
        {
            match.remove();
            this.dispo.delete(id);
        }
        this.s.delete(id);
    }

    getRoom(id:number): Game
    {
        return this.s.get(id);
    }

    getClients(id:number): Socket[]
    {
        if(this.s.get(id))
            return [this.s.get(id).player1, this.s.get(id).player2];
        else
            return [null,null];
    }


    async findRoom(id:number)
    {
        this.s.get(id);
    }

    startstream(client:Socket, data:number): boolean
    {
        // retourne un booleen si un stream a ete creer ou non
        //s[0] === client s[1] === room associate devra etre associe a data
        if(this.stream && this.stream.get(data))// si le stream existe deja
        {
            this.stream.get(0).push(client); // ajoute le client a la liste de stream   
            return false;
        }
        else
        {
            var i = new Array<Socket>;
            i.push(client);
            this.stream.set(data, i);
            return true;
        }// creer le stream
    }

    getStream(data:number)
    {
        if(this.stream)
            return this.stream.get(data);// par default sera a 0
    }

}