import { Injectable , OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
//import { Room } from 'src/game/room.interface';
import { Socket} from "socket.io";
import session from "express-session";
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { Match } from 'src/entities/match.entity';
import { User/*, UserStatus */, } from 'src/entities/user.entity';// j exporte l enum


import { match } from "assert";
import { find } from "rxjs";
import { FindOptionsWhere, getManager, NoVersionOrUpdateDateColumnError, OptimisticLockCanNotBeUsedError } from "typeorm";
import { SqljsEntityManager } from "typeorm/entity-manager/SqljsEntityManager";

/*
enum UserStatus {
    ONLINE = "Online",
    OFFLINE = "Offline",
    MATCHING = "Matching",
    PLAYING = "Playing",
    BANNED = "Banned"
}*/


// public io: Server = null
//    this.

// client.data.login

export class Game {
    public match: Match;
    public user1: User;
    public user2: User;
    public user1_login: string;
    public user2_login: string;
    public id: number;
    public room_id: number;
    public nb_player: number;
    public score1: number;
    public score2: number;

    public player1: Socket;
    public player2: Socket;
    
    public Box1x: number;
    public Box2x: number;

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

export class Invitation {
    public user1:User;
    public player1:Socket;
    public user2:User;
    public player2:Socket;
    public connect1:boolean;
    public connect2:boolean;
}

@Injectable()
export class GameService {
 
    public stream: Map<number, Array<Socket>>;
    public s: Map<number, Game>;
    public invit: Map<number, Game>;
    
    // je dois le l enlever
    //public dispo:  Set<number>;
    public dispoUser: Set<[User, Socket]>

    // je vais partir de ce cas 0,1,2 
    // bool1 client1 est invite / bool2 client2 est invite
    public invitation: Set<Invitation>// user1 , user2 sont ils dans la room
    //public roominvitation: Map()// sera serait et devra etre streamble

    constructor(){
        this.stream = new Map();
        this.s = new Map();
        //this.dispo = new Set();
        this.dispoUser = new Set();
        this.invitation = new Set();
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
            //this.dispo.delete(id);
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
                    //this.dispo.delete(id);
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
                    //this.dispo.delete(id);
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

    async NotonlyBlock(user:User): Promise<[User,Socket]>
    {
        console.log('CONTESTANT');
        const iteratordispo = this.dispoUser.entries();//[User,Client]
        for(var [key, value] of iteratordispo)
        {
            if(value[0])
            {
                /*
                console.log(value[0]);
                const blocked = await UserRelationship.findOneBy([
                    {
                        ownerLogin: user.ft_login,
                        relatedLogin: value[0].ft_login
                    },
                    {
                        ownerLogin: value[0].ft_login,
                        relatedLogin: user.ft_login
                    }
                ] as FindOptionsWhere<UserRelationship>);
                if(blocked.status != UserRelationship.Status.BLOCKED)*/
                if(value[0] != user)
                    return value;
            }
        }
        return null;
    }

    ReplaceClient(user:User, client:Socket): boolean
    {
        for(var [key, value] of this.s.entries())// va passer sur toute les game
        {
            if(value && (user === value.user1 || user === value.user2))
            {
                return true;
            }
        }
        return false;
    }
/*
    export class Invitation {
        public user1:User;
        public player1:Socket;
        public user2:User;
        public player2:Socket;
        public connect1:boolean;
        public connect2:boolean;
    }
*/
//var room: Game = {



    CreateInvitation(user1:User,user2:User)
    {
        const i : Invitation = {
            user1: user1,
            player1: null,
            user2: user2,
            player2: null,
            connect1: false,
            connect2: false,
        } 
        this.invitation.add(i);
    }

    ClientInvitationConnection(user:User,client:Socket)
    {
        if(this.invitation)
        {
            for(var [key, value] of this.invitation.entries())
            {
             if(value && (user === (value.user1) || user === value.user2))
             {
                 if(value.user1 == user)
                 {
                     value.player1 = client;
                     value.connect1 = true;
                 }
                 if(value.user2 == user)
                 {
                     value.player2 = client;
                     value.connect2 = true;
                 }
             }
            }
        }
    }


    Invitation(user:User): Invitation
    {
        for(var [key, value] of this.invitation.entries())// va passer sur toute les game
        {
            if(value && (user === (value.user1) || user === value.user2))
                return value;
        }
        return null;
    }

    

    async createGame(contestant:[User,Socket], user:User, client:Socket): Promise <number>
    {
        console.log('LANCEMENT JEU');
        const m = new Match();
        m.score1 = 0;
        m.score2 = 0;
        m.user1 = contestant[0];
        m.user2 = user;
        await Match.save(m);//sauvegarde le match
        var room: Game = {
            match: m,
            user1: contestant[0],
            user2: user,
            user1_login: contestant[0].ft_login,
            user2_login: user.ft_login,
            id: m.id,
            room_id: m.id,
            nb_player: 2,
            score1: 0,
            score2: 0,
            player1: contestant[1],
            player2: client,
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
            User.update(contestant[0].ft_login, {status:User.Status.PLAYING});
            User.update(user.ft_login, {status:User.Status.PLAYING});     
            if (l < 0.5)
              room.zdir = -0.05;
            room.xangle = l * 0.5;
            room.id = m.id;
            room.room_id = m.id;
            // cence effacer le contestant ici
            this.dispoUser.delete(contestant);//efface le premier  des contestants
            this.s.set(room.id , room);// donne la room id
            console.log(room.id);
            return room.id;
    }

    ClientChange(id_role: number[], client:Socket)
    {
        if(!id_role)
            console.log('ID_ROLE NULL');
        if(id_role)
        {
            var room = this.s.get(id_role[0]);// n arrive paas a acceder a ca
            if(id_role[1] === 1)
             room.player1 = client;
            if(id_role[1] === 2)
             room.player2 = client;
        }
    }

    // marche pour le player 1 mais pas le 2
    async Idrole(client:Socket): Promise<number[]>
    {
        const user = await User.findOne({where: {ft_login: client.data.login}});
        for(var [key, value] of this.s.entries())// va passer sur toute les game
        {
            if(value && (user.ft_login === value.user1.ft_login || user.ft_login === value.user2.ft_login))
            {
                if(user.ft_login === value.user1.ft_login)
                    return [key, 1];
                if(user.ft_login === value.user2.ft_login)
                    return [key, 2];
            }
        }
        return null;
    }


    // genere un boolean si le client est replace avec la game associe


    ReplaceMatched(user:User, client:Socket)
    {
        for(var [key, value] of this.dispoUser.entries())
        {
            if(value && value[0])
            {
                if(value[0] == user)
                    value[1] = client;
            }
        }
        return null;  
    }

    FindGame(user:User)
    {
        for(var [key, value] of this.s.entries())
        {
            if(value)
                console.log(value);
            if(value.user1.ft_login == user.ft_login || value.user2.ft_login == user.ft_login)
            {
                return key;
            }
        }
        return null;  
    }

    InsideGame(user:User)
    {
        for(var [key, value] of this.s.entries())
        {
            if(value)
                console.log(value);
            if(value.user1.ft_login == user.ft_login || value.user2.ft_login == user.ft_login)
            {
                return true;
            }
        }
        return false;  
    }

    InsideDispo(user:User)
    {
        for(var [key,value] of this.dispoUser.entries())
        {
            if(value && value[0] == user)
                return true;
        }
        return false;
    }

    async newGame(client:Socket): Promise<[number, boolean]>//Promise<number[]>
    {
        console.log('START');
        const user = await User.findOne({where: {ft_login: client.data.login}});
        if(user == null)
        {
            console.log('USER NULL');
            return [null, false];
        }
        if(this.InsideGame(user)/*user.status == User.Status.PLAYING*/)// si le user est deja en train de jouer ... Marche pas parce que meme player
        {
            console.log('EST DEJA DANS UNE GAME');
            console.log('FINDGAME ' + this.FindGame(user));
            return [this.FindGame(user), true];
        }
        if(this.InsideDispo(user)/*user.status == User.Status.MATCHING*/)// MARCHE PAS COMME CA
        {
            console.log('EST EN TRAIN DE MATCHER');
            this.ReplaceMatched(user, client);
            return [null, true];
        }
        if(this.Invitation(user))// le joueur est invitee
        {
            this.ClientInvitationConnection(user,client)
            var invit = this.Invitation(user);
            if(invit.connect1 && invit.connect2)
            {
                var n:number = await this.createGame([invit.user1, invit.player1], invit.user2, invit.player2);
                this.invitation.delete(invit);
                return [n, false];
            }
            return [null, false];
            
        }
        const contestant = await this.NotonlyBlock(user);
        if(contestant == null)// Pas de Dispo Ou personne uniquement block
        {
            // J ARRIVE QUAND MEME ICI ?
            this.dispoUser.add([user, client]);
            console.log('CONTESTANT NULL');
            User.update(user.ft_login, {status: User.Status.MATCHING});
            //user.status = User.Status.MATCHING;// mais le user en MATCHING
            return null;
        }
        else// a un contestant creer le Match et le GAME EN MEME TEMPS
        {
            console.log('Classic Contest');
            return [(await this.createGame(contestant, user, client)), false];
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
        this.s.get(id).Box1x += 0.6;
    }

    player1x_left(id:number)
    {
        this.s.get(id).Box1x -= 0.6;
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


    endStream(client:Socket, id:number)
    {
        //public stream: Map<number, Array<Socket>>;
        if(id != -1)
        {   // index of retourne l index ala first match value
            const i = this.stream.get(id).indexOf(client, 0);// a partir de l element 0
            if(i > -1)
            {
                this.stream.get(id).splice(i,1);// splice efface un element a partir de index
            }
            if(this.stream.get(id) === null)// si le stream est null efface l index
            {
                this.stream.delete(id);
            }
        }
    }

    async endGame(client: Socket, id: number)// je ne sait pas si j implemente directement le score a la fin ou pendant
    {
        const m:Game = this.s.get(id);
        const match = await Match.findOneBy({id: id});
        if(m.nb_player === 1)
        {
            match.remove();
            //this.dispo.delete(id);
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
        if(this.stream && this.stream.get(data))// si le stream existe deja
        {
            this.stream.get(data).push(client);//ajoute le client a la liste de stream   
            return false;
        }
        else
        {
            var i = new Array<Socket>;
            i.push(client);
            this.stream.set(data, i);
            return true;
        }
    }

    getStream(data:number)
    {
        if(this.stream)
            return this.stream.get(data);// par default sera a 0
    }

    async CreateMatchID(data:number)// plus xp
    {
        console.log('MATCH history');
        var room = this.s.get(data);
        if(room)
        {
            // ne find pas les bons users
            // surement mauvaise association entre username et client
            var u1 = await User.findOneBy({socket: room.player1.id});// cherche user1
            var u2 = await User.findOneBy({socket: room.player2.id});// cherche user2
            if(u1 == null && u2 == null)// si les deux joueurs sont des visitor
            {
                console.log('Tout les deux null');
                return;
            }
            // j ai directement les playeurs
            var match = Match.create();
            match.user1 = u1;
            match.user2 = u2;
            if(u1)
            {
                if(room.score1 > room.score2)
                    u1.gainXP(100);
                if(room.score1 < room.score2)
                    u1.looseXP(50);
            }
            if(u2)
            {
                if(room.score2 > room.score1)
                    u2.gainXP(100);
                if(room.score2 < room.score1)
                    u2.looseXP(50);
            }
            match.score1 = room.score1;
            match.score2 = room.score2;
            await Match.save(match);
            var listMatch = await Match.find();
            console.log(listMatch);
        }
    }

}