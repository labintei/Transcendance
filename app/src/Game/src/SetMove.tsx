
import React, { useEffect } from 'react';
import './PongGame.css';
import Timer from './Timer/timer';
import World from './World/World';
import {useStore} from './State/state'
import Menu from './Menu/menu';
import { io, Socket } from "socket.io-client";
import { socket } from "./PongGame"

export function SetMove()
{
    let c :number;
    //U = useStore((state:any) => state.player1Move(data))
    useEffect(() => {
        socket.on('rendering', () => {console.log('changes les var')});
        socket.on('wait_game', () => { console.log('recu');socket.emit('game')});
        socket.on('game_mess', () => { console.log('recu');});
        // voir comment recuperer la data d une socket
        //var p1_move = useStore((state:any)) ;
        // player1Move: (num:number) => set((state:any)=>({data : [state.data.player1_x = num]})),
        //onst P1Move:any = useStore((state:any) => state.player1Move);
      
        //socket.on('player1_move', (data) => {useStore((state:any) => state.player1Move(data))});
        //c = socket.on('player1_move', 'data');
        
        //
    
            //useStore((state:any) => state.player1Move(data));
    
        socket.on('error', () => { console.log('error')})
        //console.log(ready);
        return () => {
          socket.off('wait_game');
          socket.off('error');
          socket.off('disconnect_game');
          socket.disconnect();
        }
      }, [])

    ///////////useStore((state:any) => state.player1Move);
    
}
