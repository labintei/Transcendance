import { Injectable  } from "@nestjs/common";
import { Socket} from "socket.io";
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';
import { FindOptionsWhere } from "typeorm";
import { clearInterval } from "timers";

export class Game {
    public match: Match;
    public user1: User;
    public user2: User;
    public id: number;
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
}

export class Invitation {
    public match_id:number;
    public user1:User;
    public player1:Socket;
    public user2:User;
    public player2:Socket;
    public connect1:boolean;
    public connect2:boolean;
}

@Injectable()
export class GameService {

    public stream: Map<number, [Array<Socket>, any]>;
    public s: Map<number, Game>;
    public dispoUser: Set<[User, Socket]>
    public invitation: Set<Invitation>

    constructor(){
        this.stream = new Map();
        this.s = new Map();
        this.dispoUser = new Set();
        this.invitation = new Set();
    }

    async IsInvitation(client:Socket, data:number): Promise<boolean> {
        var l  = (client.request as any).user;
        for( var [key, value] of this.invitation.entries())
        {
            if(value && value.match_id == data && (
                    (l == value.user1.ft_login) || 
                    (l == value.user2.ft_login)))
                return true;
        }
        return false;
    }

    async getInvitation(client:Socket, data:number): Promise<Invitation> {
        const user1 =  await User.findOne({where: {ft_login: client.data.login}});
        for( var [key, value] of this.invitation.entries())
        {
            if(value && value.match_id == data)
                return value;
        }
        return null;
    }

    async DeleteInvitation(data:number) {
        for( var [key, value] of this.invitation.entries())
        {
            if(value && value.match_id == data)
                this.invitation.delete(value);
        }
    }

    async LaunchInvitation(client:Socket, data:number): Promise<[number,boolean]> {
        const I = await this.getInvitation(client, data);// obtient l invitation
        if(I.user1.ft_login == client.data.login)
        {
            I.player1 = client;
            I.connect1 = true;
        }
        else if(I.user2.ft_login == client.data.login)
        {
            I.player2 = client;
            I.connect2 = true;
        }
        if(I.connect1 === true && I.connect2 === true)
        {
            var m = await Match.findOneBy({id: I.match_id});// creer la room
            var room = await this.createRoom(I.user1, I.player1, I.user2, I.player2, m);// creer la room
            this.DeleteInvitation(I.match_id);
            return [I.match_id,true];
        }
        else
            return [null, false];
    }


    getUsernames(data:number): [string,string] {
        var room = this.s.get(data);
        if(room)
            return([room.user1.username, room.user2.username])
    }

    async NotBlock(user1login:string, user2login:string): Promise<boolean> {
        const blocked = await UserRelationship.findOneBy([
            {
                ownerLogin: user1login,
                relatedLogin: user2login,
                status: UserRelationship.Status.BLOCKED
            },
            {
                ownerLogin: user2login,
                relatedLogin: user1login,
                status: UserRelationship.Status.BLOCKED
            }
        ] as FindOptionsWhere<UserRelationship>);
        if((!blocked && user1login !== user2login)) {
            return true;
        }
        return false;
    }


    async CreateInvit(user1: User , user2: User) {
        if(await this.NotBlock(user1.ft_login, user2.ft_login)) // deux user non block
        {
            if(this.InsideGame(user1))// Si tu es deja en train de jouer fini d abord ta game
                return -1;
            for(var [key,value] of this.invitation.entries())// verifie pour ne pas regenerer des invitations 
            {
                if(value)
                    if(((value.user1.ft_login == user1.ft_login) && (value.user2.ft_login == user2.ft_login))
                    || (value.user1.ft_login == user2.ft_login) && (value.user2.ft_login == user1.ft_login))
                        return value.match_id;
            }
            const m = await this.createMatch(user1, user2);
            this.CreateInvitation(user1,user2, m.id);
            return m.id;
        } else
            return -1;
    }

    isFinish(data:number) {
        if(this.s.get(data).score1 >= 2 || this.s.get(data).score2 >= 2 || this.s.get(data).time > 300)
            return true;
        return false;
    }

    DisconnectionGameId(id:number) {
        var room = this.s.get(id);
        if(room)
        {
            clearInterval(room.render);
            clearInterval(room.timer);
            var id = room.id;
            this.s.delete(id);
        }
    }

    DisconnectionGame(client:Socket): Socket[] {
        for(var [key, value] of this.s.entries())
        {
            if(value)
            {
                if(value.player1 == client ||
                    value.player2 == client)
                {
                    var clients = [value.player1,value.player2];
                    this.DeleteStream(value.id);
                    clearInterval(value.render);
                    clearInterval(value.timer);
                    var id = value.id;
                    this.s.delete(id);
                    return clients;
                }
            }
        }
        return [null,null];
    }

    IsInside(client:Socket) {
        for(var [key, value] of this.s.entries())
        {
            if(value)
            {
                if(value.player1 == client ||
                    value.player2 == client)
                    return true;
            }
        }
        return false;       

    }

    IsinDispoDelete(client:Socket) {
        for(var [key, value] of this.dispoUser.entries())
        {
            if(value)
            {
                if(value[1] == client)
                {
                    this.dispoUser.delete(value);
                    return true;
                }
            }
        }
        return false;  
    }

    IsInvitDelete(client:Socket) {// Enleve de toutes les autres Invit
        var l  = (client.request as any).user;
        for( var [key, value] of this.invitation.entries())
        {
            if(value && ((l == value.user1.ft_login) || (l == value.user2.ft_login)))
            {
                if(l == value.user1.ft_login)
                {
                    l.player1 = null;
                    l.connect1 = false;
                }
                if(l == value.user2.ft_login)
                {
                    l.player2 = null;
                    l.connect2 = false;
                }
            }
        }
        return false;
    }

    sphereroom(id:number): number[] {
        if(!this.s.get(id))
            return [0,0];
        var g = this.sphere(this.s.get(id));
        return g;
    }

    getPos(data:number): number[] {
        var room = this.s.get(data);
        if(room)
            return [Number(room.sx.toFixed(3)) , Number(room.sz.toFixed(3)), Number(room.Box1x.toFixed(1)) , Number(room.Box2x.toFixed(1)), room.time, room.score1, room.score2];
        return ([0,0,0,0,0,0,0])
    }

    sphere(room:Game): number[] {
        var sz = Math.floor(room.sz);
        var b2x = Math.round(room.Box2x * 10) / 100;
        var b1x = Math.round(room.Box1x * 10) / 100;

        room.sx += room.xangle;
        room.sz += room.zdir;

        if(room.zdir > 0.1)
         room.zdir -= 0.005;
        if(room.zdir < (-0.1))
          room.zdir += 0.005;
        let newVal = Math.round(room.sz * 10) / 10
        if (
            newVal === 3.9 &&
            room.sx >= b1x - 1 &&
            room.sx <= b1x + 1
        ) {
        room.xangle += Math.random() * (0.3 - (-0.3)) + (-0.3);
        room.zdir = -0.3;
        }
        if (sz === -5 && room.sx >= b2x - 1.8 && room.sx <= b2x + 0.8) {
            room.zdir = 0.3;
            room.xangle += Math.random() * (0.3 - (-0.3)) + (-0.3);
        }
        if (Math.round(room.sx) === -5 || Math.round(room.sx) === 5)
            room.xangle *= -1;
        if (sz > 7 || sz < -7) {
            if (sz > 7) room.score2++;
            if (sz < -7) room.score1++;
            room.sx = 0;
            room.sz = 0;
            var l = Math.random();
            var side = Math.random();
            if (l < 0.5) room.zdir = -0.05;
            room.xangle = l * 0.1;
            if (side < 0.5) room.xangle *= -1;
            return [
            0,
            0,
            Number(room.Box1x.toFixed(1)),
            Number(room.Box2x.toFixed(1)),
            room.time,
            room.score1,
            room.score2,
            ];
        }
  return [
    Number(room.sx.toFixed(3)),
    Number(room.sz.toFixed(3)),
    Number(room.Box1x.toFixed(1)),
    Number(room.Box2x.toFixed(1)),
    room.time,
    room.score1,
    room.score2,
  ];
}

    async NotonlyBlock(user:User): Promise<[User,Socket]> {
        const iteratordispo = this.dispoUser.entries();
        for(var [key, value] of iteratordispo)
        {
            if(value[0])
            {
                const blocked = await UserRelationship.findOneBy([
                    {
                        ownerLogin: user.ft_login,
                        relatedLogin: value[0].ft_login,
                        status: UserRelationship.Status.BLOCKED
                    },
                    {
                        ownerLogin: value[0].ft_login,
                        relatedLogin: user.ft_login,
                        status: UserRelationship.Status.BLOCKED
                    }
                ] as FindOptionsWhere<UserRelationship>);
                if((!blocked) && (value[0].ft_login != user.ft_login))
                    return value;
            }
        }
        return null;
    }

    ReplaceClient(user:User, client:Socket): boolean {
        for(var [key, value] of this.s.entries())
        {
            if(value && (user === value.user1 || user === value.user2))
                return true;
        }
        return false;
    }


    CreateInvitation(user1:User,user2:User,match_id:number) {
        const i : Invitation = {
            match_id: match_id,
            user1: user1,
            player1: null,
            user2: user2,
            player2: null,
            connect1: false,
            connect2: false,
        } 
        this.invitation.add(i);
    }

    async createMatch(user1: User, user2: User): Promise<Match> {
      const m = await new Match();
      m.user1 = user1;
      m.user2 = user2;
      m.user1Login = user1.ft_login;
      m.user2Login = user2.ft_login;
      await Match.save(m);
      return m;
    }

    createRoom(user1:User, player1:Socket, user2:User, player2:Socket, m:Match): Game {
        var l = Math.random();
        var room: Game = {
            match: m,
            user1: user1,
            user2: user2,
            id: m.id,
            nb_player: 2,
            score1: 0,
            score2: 0,
            player1: player1,
            player2: player2,
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
        User.update(room.user1.ft_login, {status:User.Status.PLAYING});
        User.update(room.user2.ft_login, {status:User.Status.PLAYING});     
        Match.update(m.id, {status: Match.Status.ONGOING});
        if (l < 0.5)
          room.zdir = -0.05;
        room.xangle = l * 0.5;
        room.id = m.id;
        this.s.set(room.id , room);
        return room;
    }

    async createGame(contestant:[User,Socket], user:User, client:Socket): Promise <number> {
        const m = await this.createMatch(contestant[0], user);
        const room = this.createRoom(contestant[0], contestant[1], user, client, m);
        await this.dispoUser.delete(contestant);
        return room.id;
    }

    ClientChange(id_role: number[], client:Socket) {
        if(id_role)
        {
            if(id_role[1] === 1)
                this.s.get(id_role[0]).player1 = client;
            if(id_role[1] === 2)
                this.s.get(id_role[0]).player2 = client;
        }
    }

    async Idrole(client:Socket): Promise<number[]> {
        const user = await User.findOne({where: {ft_login: client.data.login}});
        for(var [key, value] of this.s.entries())
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

    ReplaceMatched(user:User, client:Socket) {
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

    FindGame(user:User) {
        for(var [key, value] of this.s.entries())
        {
            if(value.user1.ft_login == user.ft_login || value.user2.ft_login == user.ft_login)
                return key;
        }
        return null;  
    }

    InsideGame(user:User) {
        for(var [key, value] of this.s.entries())
        {
            if(value.user1.ft_login == user.ft_login || value.user2.ft_login == user.ft_login)
                return true;
        }
        return false;  
    }

    InsideDispo(user:User) {
        for(var [key,value] of this.dispoUser.entries())
        {
            if(value && value[0] == user)
                return true;
        }
        return false;
    }

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    async newGame(client:Socket): Promise<[number, boolean]> {
        const user = await User.findOne({where: {ft_login: client.data.login}});
        if(user == null)
            return [null, false];
        if(this.InsideGame(user))
            return [this.FindGame(user), true];
        if(this.InsideDispo(user))
        {
            this.ReplaceMatched(user, client);
            return [null, true];
        }
        const contestant = await this.NotonlyBlock(user);
        if(contestant == null)
        {
            this.dispoUser.add([user, client]);
            User.update(user.ft_login, {status: User.Status.MATCHING});
            return null;
        }
        else
            return [(await this.createGame(contestant, user, client)), false];
    }

    Isyourgame(client:Socket, data:number): boolean
    {
        if(this.s.get(data) && ((this.s.get(data).user1.ft_login == client.data.login) || (this.s.get(data).user2.ft_login)))
            return true;
        return false;
    }

    addtime(data:number){
        var room = this.s.get(data);
        if(room)
            room.time= room.time + 1;
    }


    player2x_right(id:number, client:Socket) {
        if(this.s.get(id).player2 == client)
            this.s.get(id).Box2x += 2;
    }

    player2x_left(id:number, client:Socket) {
        if(this.s.get(id).player2 == client)
            this.s.get(id).Box2x -= 2;
    }

    player1x_right(id:number, client:Socket) {
        if(this.s.get(id).player1 == client)
            this.s.get(id).Box1x += 2;
    }

    player1x_left(id:number, client:Socket) {
        if(this.s.get(id).player1 == client)
            this.s.get(id).Box1x -= 2;
    }

    getRender(id:number):any {
        if(this.s.get(id))
            return this.s.get(id).render;
        return null;
    }

    getTimer(id:number):any {
        if(this.s.get(id))
            return this.s.get(id).timer;
        return null;
    }

    SetRender(id:number, render:any) {
        if(this.s.get(id))
            return this.s.get(id).render = render;
    }

    SetTimer(id:number, timer:any) {
        if(this.s.get(id))
            return this.s.get(id).timer = timer;
    }

    getBox1(id:number): number {
        if(this.s.get(id))
            return (Number(this.s.get(id).Box1x.toFixed(1)));
        return 0;
    }

    getBox2(id:number): number {
        if(this.s.get(id))
            return (Number(this.s.get(id).Box2x.toFixed(1)));
        return 0;
    }

    endStream(client:Socket, id:number) {
        if(id != -1)
        {
            const i = this.stream.get(id).indexOf(client, 0);
            if(i > -1)
                this.stream.get(id).splice(i,1);
            if(this.stream.get(id) === null)
                this.stream.delete(id);
        }
    }

    DeleteStream(id:number)
    {
        clearInterval(this.stream.get(id)[1]);
        this.stream.delete(id);
    }


    getClients(id:number): Socket[] {
        if(this.s.get(id))
            return [this.s.get(id).player1, this.s.get(id).player2];
        else
            return [null,null];
    }

    room(id:number): boolean {
        if(this.s.get(id))
            return true;
        return false;
    }

    startstream(client:Socket, data:number): boolean {
        if(this.stream && this.stream.get(data))
        {
            this.stream.get(data)[0].push(client);  
            return false;
        }
        else
        {
            var i = new Array<Socket>;
            i.push(client);
            this.stream.set(data, [i , null]);
            return true;
        }
    }

    SetStreamRender(data:number, render:any){
        if(this.stream.get(data))
            this.stream.get(data)[1] = render;
    }

    getStream(data:number): [Array<Socket>,any]{
        if(this.stream)
            return this.stream.get(data);
    }

    async CreateMatchID(data:number) {
        var room = this.s.get(data);
        if(room)
        {    
            const u1 = await User.findOneBy({ft_login: room.player1.data.login});
            const u2 = await User.findOneBy({ft_login: room.player2.data.login});
            if(u1 == null || u2 == null)
                return;
            await Match.update(data, {score1: room.score1, score2: room.score2, status: Match.Status.ENDED});
            const m = (await Match.findOne({where: {id:data}, 
                relations: {
                    user1 : true, user2 : true} }));
            m.resolve();
        }
    }

}