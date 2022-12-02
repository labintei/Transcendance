import { Injectable , OnModuleInit } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
//import { Room } from 'src/game/room.interface';
import { Socket} from "socket.io";
import session from "express-session";

// public io: Server = null
//    this.

export interface Game  {
    id: number;
    nb_player: number;
    player1: Socket;
    player2: Socket;
    player1_x: number;
    player2_x: number;
    // mettre toutes les donnees necessaire
}

@Injectable()
export class GameService {
 
    constructor(){this.s = new Map();}

    public s: Map<number, Game>;
    // set(ajoute)get(find)has(bool)size(nombre:game)delete(key)clear()
    // fait une liste des joueurs en jeu (est ce vraiment necessaire)
    
    async newRoom(id: number, client: Socket)
    {
        const room: Game = {
            id: id,
            nb_player: 1,
            player1: client,
            player2: null,
            player1_x: 1,
            player2_x: 2,
        }
        this.s.set(id , room);
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