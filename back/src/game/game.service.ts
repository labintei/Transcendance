import { Injectable , OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
//import { Room } from 'src/game/room.interface';
import { Socket} from "socket.io";
import session from "express-session";
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';


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
 


    // Liste de Game
    public stream: Map<number, Array<Socket>>;// number correspond a l id de la room Socket aux socket correspondant  
    // probleme plusieurs fois la meme key
    // Ce qui va etre enervant c est de push a chaque fois je vais opter pour un Array
    public s: Map<number, Game>;
    public invit: Map<number, Game>;
    // Liste de Game dispo (dispo et number) // une liste de room id sera suffisant
    // je vais plutot le mettre sous vector
    public dispo:  Set<number>;
    //public dispo: Array<number>;
    //public dispo: Map<number, number>;
    constructor(){
        this.stream = new Map();
        this.s = new Map();
        this.dispo = new Set()
        //this.dispo = new Array();
    }

    // probleme peut pas faire les emit ici


    Getlist(): Array<[number,string,string]>
    {
        let list: Array<[number,string,string]> = []

        for(var [key, value] of this.s.entries())
        {
            if(value)
            {
                if(value.ready === true)
                {
                    var ft_login1 = (value.player1.request as any).user;
                    var ft_login2 = (value.player2.request as any).user;
                    list.push([key, ft_login1, ft_login2]);
                }
            }
        }
        return list;
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

    getPos(data:number): number[]
    {
        var room = this.s.get(data);
        if(room)
            return [Number(room.sx.toFixed(3)),Number(room.sz.toFixed(3)), Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1))];
        return ([0,0,0,0])// valeur par default tout a 0
    }

    sphere(room:Game): number[]
    {
        // remttre les colission avec les boxs et autres

        //console.log("SPHERE")
      
      // parseFloat

      // correspond techniquement a 0.5
      
      //var width = 0.5;
        var width = 1;

      /*var sz = Number(room.sz.toFixed(3));
      var sx = Number(room.sx.toFixed(3));

      var b1x = Number(room.Box1x.toFixed(2));// 2 de precision
      var b2x = Number(room.Box2x.toFixed(2));// 
      
      room.sz += Number(room.zdir.toFixed(3));
      room.sx += Number(room.xangle.toFixed(3));

      var x = room.sx;
      var y = room.sz;*/

    // reprendre le model de variable

        var sz = Math.floor(room.sz);
        var sx = Math.round(room.sx * 10) / 100;
        var b2x = Math.round(room.Box2x * 10) / 100;
        var b1x = Math.round(room.Box1x * 10) / 100;

        room.sx += room.zdir;
        room.sz += room.zdir;

       // console.log('sz ' + sz + ' sx ' + sx + ' b2x ' + b2x + ' b1x ' + b1x);
      //client.emit('newpos', [x, this.s.get(id).sz]);
        // deceleration
      if(room.zdir > 0.1)
        room.zdir -= 0.005;
      if(room.zdir < (-0.1))
        room.zdir += 0.005;

    if(sz === (4) &&
    ((sx >= (b1x - 0.8)) && 
    (sx <= (b1x + 1.8))))
    {
        console.log('collision');
        // xangle

        room.zdir = -0.3;// corresond a box1.z = 5
    }  
    if(sz === (-5) && 
        ((sx >= (b2x - 1.8)) &&
        (sx <= (b2x + 0.8))))
    {
        console.log('collision');
        room.zdir = 0.3;// correspond a box2.z = -5
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
        return [0,0, Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1))];
      }   
    return [Number(room.sx.toFixed(3)),Number(room.sz.toFixed(3)), Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1))];
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
        
        if(this.dispo.size === 0)// aucune room dispo
        {
            // ne pas creer le match ici
            /*          
            const m = new Match();    
            m.score1 = 0;
            m.score2 = 0;
            
            m.user1 = await User.findOneBy({ft_login: (client.request as any).user});
            console.log('User1 ? : ' + m.user1);
            await m.save();
            */
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
            if (l < 0.5)
              room.zdir = -0.05;
            room.xangle = l * 0.5;
            var l = this.s.size;
            this.s.set(l , room);
            this.dispo.add(l);
            const s = [l, 1];
            return s;
        }
        else
        {/*
            user1 = await User.findOneBy({ft_login: (client.request as any).user});
            if(await User.findOneBy({ft}))*/
            
            console.log(this.dispo);
            var iterator = this.dispo.values();
            var value = iterator.next().value;
            var room = this.s.get(value);
            /*console.log('JOIN other room');
            console.log(room);*/
            if(room)
            {
                room.ready = true;
                room.player2 = client;
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



    setTimer(id:number)// pas utile pour mettre le timer
    {
        var i = setInterval(() => {
            this.s.get(id).time += 1;
            console.log('Time ' + String(this.s.get(id).time));// penser a clear l interval
        }, 1000)
        //    while(this.s.get(id))
        
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


    test()
    {
        console.log('ok');
    }

    


    async endGame(client: Socket, id: number)// je ne sait pas si j implemente directement le score a la fin ou pendant
    {/*
        const m:Game = this.s.get(id);
        const match = await Match.findOneBy({id: id});
        if(m.nb_player === 1)
        {
            match.remove();
            this.dispo.delete(id);
        }
        this.s.delete(id);*/
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
        if(this.stream && this.stream.get(0))// si le stream existe deja
        {
            this.stream.get(0).push(client); // ajoute le client a la liste de stream   
            return false;
        }
        else
        {
            var i = new Array<Socket>;
            i.push(client);//
            this.stream.set(0, i);
            return true;
        }// creer le stream
    }

    getStream(data:number)
    {
        if(this.stream)
            return this.stream.get(data);// par default sera a 0
    }


    initBall(roomId: number ) {
        // declare une nouvelle variable
        //const r = GameService.rooms.find((room) => room.id === roomId);// trouve r
        //r.ballx = 42
    }

    updateBall(roomId: number) {

    }

}