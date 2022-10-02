import React, { useEffect } from 'react';
import './PongGame.css';
import Timer from './Timer/timer';
import World from './World/World';
import {useStore} from './State/state'
import Menu from './Menu/menu';


export default function PongGame() {

  const getScore:any = useStore((state:any) => state.score);

  return (
    <div className="App" tabIndex={0} >

      <div className='info'>THE 3D 42 PONG GAME</div>
     <World />
    <div className='score'>
      <div className='elem'>
      Score: 
      <div>{getScore[0]} - {getScore[1]}</div>
      </div>
    </div>

      <Timer nb={5}/>
      <Menu/>
    </div>
  );
}

