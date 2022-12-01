import React, { useEffect } from 'react';
import {useStore} from './State/state'
import { io, Socket } from "socket.io-client";

export interface Game_data {
    id: number;
    nb_player: number;
    player1: Socket;
    player2: Socket;
    player1_x: number;
    player2_x: number;
  }