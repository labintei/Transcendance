import { Server, Socket } from 'socket.io';

export interface Game  {
    id: number;
    nb_player: number;
    player1: Socket;
    player2: Socket;
    player1_x: number;
    player2_x: number;
    // mettre toutes les donnees necessaire
}


