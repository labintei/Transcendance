import React, { useEffect } from 'react';
import './PongGame.css';
import Timer from './Timer/timer';
import World from './World/World';
import {useStore} from './State/state'
import Menu from './Menu/menu';
import { io, Socket } from "socket.io-client";



export interface Game_data {
  id: number;
  nb_player: number;
  player1: Socket;
  player2: Socket;
  player1_x: number;
  player2_x: number;
}

const secu_url = process.env.REACT_APP_BACKEND_URL || '';
export const socket = io(secu_url);

export default function PongGame(props: any) {

  const getScore:any = useStore((state:any) => state.score);
  const ready = useStore((s:any) => s.gameReady)
  console.log(props)

  useEffect(() => {
    socket.on('wait_game', () => { console.log('recu');socket.emit('game')});
    socket.on('error', () => { console.log('error')});
    console.log(ready)
  }, [ready])

  socket.emit('pong');

  return (
    <div className="App" tabIndex={0} >

      {}
      {/*<World/>*/}
    <div className='score'>
      <div className='elem'>
      Score: 
      <div>{getScore[0]} - {getScore[1]}</div>
      </div>
    </div>

    {/*ready === false &&   <Timer nb={3}/>*/}
      <Menu/>
    </div>
  );
}

