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


export interface Game  {
    id: number,
    nb_player: number,
    score1: number,
    score2: number,
    player1: Socket,
    player2: Socket,
    player1_x: number,
    player2_x: number,
    Box1x: number,
    Box2x: number,
    //Setbox1x(num: number): void;

    //setBox1x(num:number): number{return (this.Box1x + 0,2);}
    // mettre toutes les donnees necessaire
}

@Injectable()
export class GameService {
 
    constructor(){this.s = new Map();this.dispo = new Set()}

    // Liste de Game
    public s: Map<number, Game>;
    // Liste de Game dispo (dispo et number) // une liste de room id sera suffisant
    public dispo:  Set<number>;
    //public dispo: Map<number, number>;
    


    // aimerais rajouter le statut dans Map
    // j aimerais a la fois pouvoir le trouver avec 
    //id:status:Game
    //public sbis: Map<{number, {Game, number}} 


    // set(ajoute)get(find)has(bool)size(nombre:game)delete(key)clear()
    // fait une liste des joueurs en jeu (est ce vraiment necessaire)
    

    // les questions que je me pose c est qu il faudrait pas que
    // partie soit deja prise alors que la fonction est en cour
    async newGame(client:Socket)
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
            nb_player: 1,
            score1: 0,
            score2: 0,
            player1: client,
            player2: null,
            player1_x: 1,
            player2_x: 2,
            Box1x:0.0,
            Box2x:0.0,
            }
            console.log('Box1');
            console.log(room.Box1x);
            console.log('Room');
            console.log(String(m.id));// est undefined
            console.log(m.id);
            console.log(String(room.id));
            this.s.set(room.id , room);// permet de reconnaitre la room a l id
            this.dispo.add(room.id);
            const s = [room.id , 1];
            client.emit('start', s);
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

    

    async player1x_right(id:number): Promise<number>
    {
        var c = await this.s.get(id);
        var box = await c.Box1x;
        var t = await (c.Box1x + 0.2);
        box = t;
        //console.log(' Box1_x : ' + String(c.Box1x));
        return box;
    }

    async player1x_left(id:number): Promise<number>
    {
        var d = await this.s.get(id);
        var box = await d.Box1x;
        var t = await (box - 0.2);
        box = t;
        return box;
    }

    player2x_right(id:number) : number
    {
        //return this.s.get(id).Box2x += 0.2;
        return 0;
    }

    player2x_left(id:number) : number
    {
        //return this.s.get(id).Box2x -= 0.2;
        return 0;
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