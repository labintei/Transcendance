import React, { useEffect } from 'react';
import './PongGame.css';
import Timer from './Timer/timer';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { io, Socket } from "socket.io-client";
import { StaticReadUsage } from 'three';




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
/*
function useSockets(d:any) {
  useEffect(() => {
      const playermove = () => {
        socket.on('player1_move', (data) => {d(data)});
      }
    }, [d])
}

export default function SocketControls() 
{
  const d = useStore((s:any) => s.data.player1_x);
  useSockets((d));
  return null;
}
*/



const secu_url = process.env.REACT_APP_BACKEND_URL || '';
export const socket = io(secu_url);

export default function PongGame(props: any) {

  let test = useStore((s:any) => s.data.player1_x);


  socket.emit('start_game');
  socket.emit('testlaulau');
  
  const getData:any = useStore((state:any) => state.data);
  const getScore:any = useStore((state:any) => state.score);
  const ready = useStore((s:any) => s.gameReady)
  console.log(props)

  useStore((state:any) => state.setReady)

  const d:any = useStore((s: any) => s.player1Move);
  const so = useStore((state:any) => state.set);

  let box1_x = useStore((s:any) => s.data);

  const B:any = useStore((s:any)=> s.Player1);// MovePlayer1
  
  let c:number = useStore((s:any)=> s.player1_x);
  
  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);

  //console.log(B);
  //console.log(useStore);
  //console.log(B);
  useEffect(() => {
    
    
    socket.on('start', (data) => {setRole(data[1]);setId(data[0])})
    /*socket.on('rendering', () => {console.log('changes les var')});
    socket.on('wait_game', () => { console.log('recu');socket.emit('game')});
    socket.on('game_mess', () => { console.log('recu');});;*/
    socket.on('box1_x', (data) => {/*console.log(data);*/B(data)});//recoit des 1 ...
    //console.log(ready);
    return () => {
      socket.off('start');
      //socket.off('wait_game');
      //socket.off('error');
      //socket.off('disconnect_game');
      //socket.disconnect();
    }
  }, [box1_x, B, c, setId, setRole])

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

