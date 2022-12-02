import React, { useEffect } from 'react';
import './PongGame.css';
import Timer from './Timer/timer';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { io, Socket } from "socket.io-client";




/*
        const room: Game = {
            id: id,
            nb_player: 1,
            player1: client,
            player2: null,
            player1_x: 1,
            player2_x: 2,
        }

*/

export interface Game_data {
  id: number;
  nb_player: number;
  player1: Socket;
  //player2: Socket;
  player1_x: number;
  player2_x: number;
}

//<Box1 position={[0, 0, 5]} />



const secu_url = process.env.REACT_APP_BACKEND_URL || '';
export const socket = io(secu_url);

export default function PongGame(props: any) {

  socket.emit('game');

  /*
  const game:Game_data = {
    id: 0,
    nb_player: 0,
    player1: socket,
    player1_x : 0,
    player2_x : 0,
  }*/
  //mettre dans state

  // mettre l interface de data dans le state
  //const getData:Game_data = useStore((state:Game_data) => state.data);
  const getData:any = useStore((state:any) => state.data);
  //game.player1_x += 0,2;
  const getScore:any = useStore((state:any) => state.score);
  const ready = useStore((s:any) => s.gameReady)
  
  //const data = useStore((s:any) => s.data.player1_x);
  console.log(props)

  useStore((state:any) => state.setReady)

  //const P1Move:any = useStore((state:any) => state.player1Move);

  //SetMove();


 // const setTheMap:any = useStore((state:any) => state.changeBgd);
  const test:any = useStore((s: any) => s.player1Move);

  
  function Change_x() {
    const test:any = useStore((s: any) => s.player1Move);
    useEffect(() => {socket.on('player1_move', (data) => {test(data);console.log(data);});
    }),[]
  }


  //useEffect(() => {
    //socket.on('player')
  //})

  Change_x();

  useEffect(() => {

    //Change_x();

    //const test2:any = useStore((s: any) => s.player1Move);
    //const addPoint1:any = useStore((state:any) => state.player1Move);
    socket.on('rendering', () => {console.log('changes les var')});
    socket.on('wait_game', () => { console.log('recu');socket.emit('game')});
    socket.on('game_mess', () => { console.log('recu');});

    //socket.on('player1_move', (data) => {test(data);console.log(data);/*useStore((state:any) => state.player1Move(data))*/});

    //socket.on('player1_move', (data) => {console.log(data); player1Move(data));
    //socket.on('error', (data) => {useStore((s:any).player1Move(data));console.log('error')})
    console.log(ready);
    return () => {
      socket.off('wait_game');
      //socket.off('error');
      socket.off('disconnect_game');
      socket.disconnect();
    }
  }, [])

  // envoit un socket pour l initialisation
  socket.emit('game');

  return (
    <div className="App" tabIndex={0} >
    {<World/>}
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

