import { ConflictException, Injectable  } from "@nestjs/common";
import { Socket} from "socket.io";
import { UserRelationship } from 'src/entities/userrelationship.entity';
import { Match } from 'src/entities/match.entity';
import { User } from 'src/entities/user.entity';
import { FindOptionsWhere } from "typeorm";
import { clearInterval } from "timers";

const boxWidth = 2;
const boxHeight = 1;
const sphereRadius = 0.5;
const boardWidth = 10;
const boardHeith = 10;
const lostBallLimit = 1;
const maxBounceAngle = 75;
const hitboxWith = (boxWidth / 2) + sphereRadius;
const hitboxHeight = (boxHeight / 2) + sphereRadius;
const xedge = (boardWidth / 2) - sphereRadius;
const yedge = (boardHeith / 2) - hitboxHeight;
const ylimit = (boardHeith / 2) + lostBallLimit;
const ballSpeed = 0.3;

class Point {
    x:number;
    y:number;
}

class Vector {
    dx: number;
    dy: number;
}

export class Game {
    public isinvit: boolean;
    public match: Match;
    public user1: User;
    public user2: User;
    public id: number;
    public nb_player: number;
    public score1: number;
    public score2: number;
    public player1: Socket;
    public player2: Socket;
    public service: boolean
    public box1_x: number;
    public box2_x: number;
    public spos: Point;
    public sdir: Vector;
    public sidebumped: boolean;
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

    isinvitroom(num:number): boolean
    {if(this.s.get(num))
            return this.s.get(num).isinvit;
        return false;
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
            room.isinvit = true;
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
                throw new ConflictException("You are already in a game.");
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
            throw new ConflictException("Someone blocked the other.");
    }

    isFinish(data:number) {
        if(this.s.get(data).score1 >= 7 || this.s.get(data).score2 >= 7 || this.s.get(data).time > 300)
            return true;
        return false;
    }

    DisconnectionGameId(id:number) {
        var room = this.s.get(id);
        if(room)
        {
            clearInterval(room.render);
            clearInterval(room.timer);
            this.DeleteStream(id);
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
        if(this.invitation.size)
        {
            for( var [key, value] of this.invitation.entries())
            {
                if(value && value.user1 && value.user2 && ((l == value.user1.ft_login) || (l == value.user2.ft_login)))
                {
                   if(l == value.user1.ft_login)
                    {
                         value.player1 = null;
                         value.connect1 = false;
                     }
                    if(l == value.user2.ft_login)
                    {
                        value.player2 = null;
                        value.connect2 = false;
                    }
            }
            }
            return false;
        }
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
            return [Number(room.spos.x.toFixed(3)) , Number(room.spos.y.toFixed(3)), Number(room.box1_x.toFixed(1)) , Number(room.box2_x.toFixed(1)), room.time, room.score1, room.score2];
        return ([0,0,0,0,0,0,0])
    }

    sphere(room:Game): number[] {
        let newx = room.spos.x + (room.sdir.dx * ballSpeed);
        let newy = room.spos.y + (room.sdir.dy * ballSpeed);

        //  if lost ball
        if (Math.abs(newy) >= ylimit) {
            if (newy > 0) {
                ++room.score2;
            }
            else {
                ++room.score1;
            }
            room.service = !room.service;
            room.spos = {x:0, y:0};
            room.sdir = {dx:0, dy:(room.service ? 1 : -1)};
            room.sidebumped = false;
            return [
                room.spos.x,
                room.spos.y,
                Number(room.box1_x.toFixed(2)),
                Number(room.box2_x.toFixed(2)),
                room.time,
                room.score1,
                room.score2,
            ];
        }

        // if ball hits edge
        if (Math.abs(newx) >= xedge) {
            const dxSign = room.sdir.dx >= 0 ? 1 : -1;
            room.sdir.dx = -room.sdir.dx;
            newx -= dxSign * (Math.abs(newx) - xedge) * 2;
        }

        // if ball potentially hit box
        if (!room.sidebumped && Math.abs(newy) >= yedge) {
            const box_x = newy > 0?room.box1_x:room.box2_x;
            const xDistToMiddle = Math.abs(newx - box_x);
            const yDistToMiddle = Math.abs((boardHeith / 2) - Math.abs(newy));
            if (xDistToMiddle < hitboxWith && yDistToMiddle < hitboxHeight) {  // if ball actually hits a box
                //  If it hits the box by the top
                if (/*(yDistToMiddle / hitboxHeight) > (xDistToMiddle / hitboxWith) &&*/ (Math.abs(newy) - yedge) <= Math.abs(room.sdir.dy)) {
                    const ySign = newy >= 0 ? 1 : -1;
                    const impactY = yedge * ySign;
                    const travelRatio = (impactY - room.spos.y) / room.sdir.dy;
                    const impactX = room.spos.x + (travelRatio * room.sdir.dx);
                    const maxAngleRad = maxBounceAngle * Math.PI / 180;
                    const newangle = Math.max(Math.min(((impactX - box_x) / hitboxWith) * maxAngleRad, maxAngleRad), -maxAngleRad);
                    room.sdir.dx = Math.sin(newangle);
                    room.sdir.dy = Math.cos(newangle) * (-ySign);
                    newx = impactX + ((1 - travelRatio) * room.sdir.dx * ballSpeed);
                    newy = impactY + ((1 - travelRatio) * room.sdir.dy * ballSpeed);
                }
                //  If it hits the box by the side
                else {
                    const side = (newx < box_x) ? -1 : 1;
                    const boxedge = box_x + (side * hitboxWith);
                    const dxSign = room.sdir.dx >= 0 ? 1 : -1;
                    if (room.sdir.dx && dxSign != side) {
                        room.sdir.dx = -room.sdir.dx;
                        newx -= dxSign * Math.abs(boxedge - newx) * 2;
                    }
                }
            }
        }

        room.spos = { x: newx, y: newy };
        return [
            room.spos.x,
            room.spos.y,
            Number(room.box1_x.toFixed(2)),
            Number(room.box2_x.toFixed(2)),
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
        var startside = Math.round(Math.random());
        var room: Game = {
            isinvit : false,
            match: m,
            user1: user1,
            user2: user2,
            id: m.id,
            nb_player: 2,
            score1: 0,
            score2: 0,
            player1: player1,
            player2: player2,
            service: startside ? true : false,
            box1_x:0,
            box2_x:0,     
            spos: {x:0, y:0},
            sdir: {dx:0, dy:(startside ? 1 : -1 )},
            sidebumped: false,
            time : 0,
            ready: false,
            timer : null,
            render : null,
        }
        //ongoingMatchId: Number;
        Match.update(m.id, {status: Match.Status.ONGOING});
        //room.user1.ongoingMatchId = m.id;
        //room.user2.ongoingMatchId = m.id;   
        // if (l < 0.5)
        //   room.zdir = -0.05;
        // room.xangle = l * 0.5;
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
            //User.update(user.ft_login, {status: User.Status.MATCHING});
            return null;
        }
        else
            return [(await this.createGame(contestant, user, client)), false];
    }

    Isyourgame(client:Socket, data:number): boolean
    {
        var l  = (client.request as any).user;
        if(this.s.get(data) && ((this.s.get(data).user1.ft_login == l) || (this.s.get(data).user2.ft_login == l)))
            return true;
        return false;
    }

    addtime(data:number){
        var room = this.s.get(data);
        if(room)
            room.time= room.time + 1;
    }

    player2x_right(id:number, client:Socket) {
        const room = this.s.get(id);
        if(room && room.player2 == client && ((room.box2_x + 0.2) < 5)) {
            if (Math.abs(room.spos.x - (room.box2_x + 0.2)) < hitboxWith && Math.abs(room.spos.y + 5) < hitboxHeight) {
                room.sidebumped = true;
                if (room.sdir.dx < 0)
                    room.sdir.dx = -room.sdir.dx;
            }
            room.box2_x = room.box2_x + 0.2;
        }
    }

    player2x_left(id:number, client:Socket) {
        const room = this.s.get(id);
        if(room && room.player2 == client && ((room.box2_x - 0.2) > -5)) {
            if (Math.abs(room.spos.x - (room.box2_x - 0.2)) < hitboxWith && Math.abs(room.spos.y + 5) < hitboxHeight) {
                room.sidebumped = true;
                if (room.sdir.dx > 0)
                    room.sdir.dx = -room.sdir.dx;
            }
            room.box2_x = room.box2_x - 0.2;
        }
    }

    player1x_right(id:number, client:Socket) {
        const room = this.s.get(id);
        if(room && room.player1 == client && ((room.box1_x + 0.2) < 5)) {
            if (Math.abs(room.spos.x - (room.box1_x + 0.2)) < hitboxWith && Math.abs(room.spos.y - 5) < hitboxHeight) {
                room.sidebumped = true;
                if (room.sdir.dx < 0)
                    room.sdir.dx = -room.sdir.dx;
            }
            room.box1_x = room.box1_x + 0.2;
        }
    }

    player1x_left(id:number, client:Socket) {
        const room = this.s.get(id);
        if(room && room.player1 == client && ((room.box1_x - 0.2) > -5)) {
            if (Math.abs(room.spos.x - (room.box1_x - 0.2)) < hitboxWith && Math.abs(room.spos.y - 5) < hitboxHeight) {
                room.sidebumped = true;
                if (room.sdir.dx > 0)
                    room.sdir.dx = -room.sdir.dx;
            }room.box1_x = room.box1_x - 0.2;
        }
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


    deleteClientStream(client:Socket)
    {
        for(var [key, value] of this.stream.entries())
        {
            if(value && value[0])
            {
                var found = value[0].find(x => x === client);
                if(found != null)
                {
                    const i = value[0].indexOf(client, 0);
                    if(i > -1)
                        value[0].splice(i,1);
                }
            }
        }
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
        if(this.stream.get(id))
        {
            clearInterval(this.stream.get(id)[1]);
            this.stream.delete(id);
        }
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


    async isBlock(client:Socket, data:number): Promise<boolean>
    {
        var l  = (client.request as any).user;
        if(this.s.get(data) && this.s.get(data).user1 && this.s.get(data).user2)
        {
            var login1 = this.s.get(data).user1.ft_login;
            var login2 = this.s.get(data).user2.ft_login;
            if((await this.NotBlock(l,login2)) && (await this.NotBlock(l,login1)))
                return false;
            return true;
        }
        return true;
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

    getStream(data:number): Array<Socket>{
        if(this.stream.get(data))
            return this.stream.get(data)[0];
        return null;
    }

    async CreateMatchID(data:number) {
        var room = this.s.get(data);
        if(room)
        {    
            const u1 = await User.findOneBy({ft_login: room.player1.data.login});
            const u2 = await User.findOneBy({ft_login: room.player2.data.login});
            if(u1 == null || u2 == null)
                return;
            //room.user1.ongoingMatchId = 0;
            //room.user2.ongoingMatchId = 0; 
            await Match.update(data, {score1: room.score1, score2: room.score2, status: Match.Status.ENDED});
            const m = (await Match.findOne({where: {id:data}, 
                relations: {
                    user1 : true, user2 : true} }));
            m.resolve();
        }
    }

}