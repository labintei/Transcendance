import React, { useEffect, useState } from 'react';
import './PongGame.css';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { socket } from '../../App' ;


export default function PongGame(props: any) {

  //constructor(){
  
  const [time, setTime] = useState(0);
  const [score, setScore]  = useState([0,0]);

  var isGameFinished = 0; 

  // marche po
  var B:any = useStore((s:any)=> s.Player1);// MovePlayer1
  var C:any = useStore((s:any)=> s.Player2);
  
  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);


  const Setx:any = useStore((s:any)=> s.Setx);
  const Setz:any = useStore((s:any) => s.Setz);
  const SetReady:any = useStore((s:any) => s.SetReady);


  const h1:any = useStore((s:any) => s.Setcx);
  const h2:any = useStore((s:any) => s.Setcy);
  const h3:any = useStore((s:any) => s.Setcz);

  // je dois donc le faire qu une seule fois


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
      
    })// me semble ok
    return () => {
      socket.off('start');
      socket.emit('endgame');
      //socket.disconnect();
    }
  }, [h1,h2,h3,SetReady,setId, setRole])

  
  /*async function Useasyncf(f:any , data:any) 
  {
    await f(data);
  }*/

  //soc.on('connect', async () => {
  useEffect(() => {
    socket.on('newpos', (data) => {Setx(data[0]);Setz(data[1]);B(data[2]);C(data[3]);});
  //  socket.on('time', (data) => {setTime(data)});
  //  socket.on('score', (data) => {setScore([data[0],data[1]])})
    return () => {
      //socket.off('time');
      socket.off('newpos');
      //socket.off('time');
      //socket.disconnect();
    }
  },[B,C,Setx,Setz])

  useEffect(() => {
    socket.on('time', (data) => {
    //  (async () => {
        //const test = awa
        /*await setTime(data);
      })();*/
      // marche pas
      
      /*setTime(data)*/
      //fetchTimer().then((time) => setTimeout(data))
      setTime(data);
    });
    socket.on('score', (data) => {setScore([data[0],data[1]])})
    return () => {
      socket.off('time');
      socket.off('score');
      //socket.disconnect();
    }
  },[setTime,setScore,time,score])

  const restartGame = function(){
    window.location.href = window.location.href;
  }

  return (
    <div className="App" tabIndex={0} >
    {<World/>}
    <div className='score'>
      <div className='elem'>
      Time:
      {<div>{time}</div>}
      Score: 
      {<div>{score[0]} - {score[1]}</div>}
    </div>
    </div>
    <div className={'endGameContainer ' + (isGameFinished ? "showEndGame" : "")}>
      <h2>Game Over</h2>
      <div className='btnRestartGame' onClick={restartGame}>
        Rejouer
      </div>
    </div>
    {  <Menu/> }
    </div>
    );
}

