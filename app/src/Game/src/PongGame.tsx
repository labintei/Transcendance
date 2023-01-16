import React, { useCallback, useEffect, useState } from 'react';
import './PongGame.css';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { socket } from '../../App' ;
import Timer from './time';

export default function PongGame(props: any) {
/*
  const [time, setTime] = useState(0);
  const [score, setScore]  = useState([0,0]);
*/
  
  var tim = 0;
  var isGameFinished = 0; 

  // marche po
  var B:any = useStore((s:any)=> s.Player1);// MovePlayer1
  var C:any = useStore((s:any)=> s.Player2);
  
  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);


  const Setx:any = useStore((s:any)=> s.Setx);
  const Setz:any = useStore((s:any) => s.Setz);
  const SetReady:any = useStore((s:any) => s.SetReady);


  //const t:any = useStore((s:any) => s.time);
  //const setT:any = useStore((s:any) => s.Otime);

  const h1:any = useStore((s:any) => s.Setcx);
  const h2:any = useStore((s:any) => s.Setcy);
  const h3:any = useStore((s:any) => s.Setcz);

  // je dois donc le faire qu une seule fois

/*
  async function Maiseuh()
  {  
    return await time;
  } 

  function hein()
  {
    return time;
  }
*/
  useEffect(() => {
    
    console.log('START');
    socket.emit('start_game');
    socket.on('start', (data) => {
      setRole(data[1]);
      setId(data[0]);
      SetReady();
      if(data[1] === 1)
      {
        h1(0);
        h2(3);
        h3(7);
      }
      else
      {
        h1(0);
        h2(5);
        h3(-9);
      }
      
    })
    return () => {
      socket.off('start');
      socket.emit('endgame');
    }
  }, [h1,h2,h3,SetReady,setId, setRole])

  
  useEffect(() => {
    console.log('1');
    socket.on('newpos', (data) => {Setx(data[0]);Setz(data[1]);B(data[2]);C(data[3]);});
    return () => {
      socket.off('newpos');
    }
  },[B,C,Setx,Setz])


  useEffect(() => {
    console.log('2')
    /*socket.on('time', (data) => {
     // tim++;
      console.log(data);
      setT(data);

    });*/
    socket.on('score', (data) => {/*setScore([data[0],data[1]])*/})
    return () => {
      //socket.off('time');
      socket.off('score');
      //socket.disconnect();
    }
  },[/*setT*/])

  const restartGame = function(){
    window.location.href = window.location.href;
  }


  //       Time:<Timer time={useStore((s:any) => s.time)}/>

  //  Time:<Timer/>
  return (
    <div className="App" tabIndex={0} >
    <World/>
    <div className='score'>
      <div className='elem'>
      Time:
      <Timer/>
      Score: 
      {/*<div>{score[0]} - {score[1]}</div>*/}
    </div>
    </div>
    <div className={'endGameContainer ' + (isGameFinished ? "showEndGame" : "")}>
      <h2>Game Over</h2>
      <div className='btnRestartGame' onClick={restartGame}>
        Rejouer
      </div>
    </div>
    <Menu/> 
    </div>
    );
}

