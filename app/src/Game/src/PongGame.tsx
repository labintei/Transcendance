import React, { useCallback, useEffect, useState , useContext} from 'react';
import './PongGame.css';
import World from './World/World';
import {useStore} from './State/state';
//import { socket } from '../../App' ;
import { start } from 'repl';
import { io} from "socket.io-client";
import { getSocketContext } from 'WebSocketWrapper';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

//const secu_url = process.env.REACT_APP_BACKEND_URL || '';
//export const socket = useContext(getSocketContext);
//export const socket = io(secu_url, {withCredentials: true});

export default function PongGame(props: any) {
  
  const socket = useContext(getSocketContext);
  const {id}  = useParams();
  const navigate = useNavigate();

  /*
  const [time, setTime] = useState(0);
  const [score, setScore]  = useState([0,0]);
*/

  const [Finish, setFinish] = useState(0);

  // marche po
  const Spectator_mode:boolean = useStore((s:any)=> s.spectator);

  var B:any = useStore((s:any)=> s.Player1);// MovePlayer1
  var C:any = useStore((s:any)=> s.Player2);
  
  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);

  // score fonctionne je n ai pas vu de probleme
  const s:any = useStore((s:any) => s.s);
  const sbis:any = useStore((s:any) => s.sbis);
  const score1:any = useStore((s:any) => s.setscore);
  const score2:any = useStore((s:any) => s.setscorebis);
  // marche
  const Setx:any = useStore((s:any) => s.Setx);
  const Setz:any = useStore((s:any) => s.Setz);
  const SetReady:any = useStore((s:any) => s.SetReady);

  var v:any = useStore((s:any) => s.setbis);
  var vbis:number = useStore((s:any) => s.t);
  const h1:any = useStore((s:any) => s.Setcx);
  const h2:any = useStore((s:any) => s.Setcy);
  const h3:any = useStore((s:any) => s.Setcz);

  // je dois donc le faire qu une seule fois

  useEffect(() => 
  {
    
    if (id != undefined)
    {
      console.log(id)


    }
    // if url with id
    //  Check if the id is known
    //    if yes, set spectator mode 

    //var parans = ...;
    if(Spectator_mode == false)
      socket.emit('start_game');
    else
      socket.emit('start_stream');   
    return() => {}
  },[])
  
  useEffect(() => {
    
    console.log('START');
    
    socket.on('start', (data) => {
      // console.log(data);
      if (id === undefined)
        navigate(`${data[0]}`);
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
      //socket.emit('endgame');
    }
  }, [h1,h2,h3,SetReady,setId, setRole])


  useEffect(() => {
    socket.on('newpos', (data) => {
      //console.log(vbis);
      if(vbis != data[4])
        v(data[4]);
      Setx(data[0]);
      Setz(data[1]);
      B(data[2]);
      C(data[3]);
      score1(data[5]);
      score2(data[6])});
    return () => {
      socket.off('newpos');
    }
  },[B,C,Setx,Setz,score1,score2,vbis,v])


  useEffect(() => {
    socket.on('endgame', () => {console.log('END');setFinish(1)});
    return () => {
      socket.off('endgame');
    }
  },[setFinish])

  const restartGame = function(){
    //window.location.href = window.location.href;
    setFinish(0);
    socket.emit('start_game');
  }

  //  Time:<Timer time={useStore((s:any) => s.time)}/>

  //  Time:<Timer/>
  return (
    <div className="App" tabIndex={0} >
    <World/>
    <div className='score'>
      <div className='elem'>
      Time:
      <div>{vbis}</div>
      Score: 
      <div>{s} - {sbis}</div>
    </div>
    </div>
    <div className={'endGameContainer ' + (Finish ? "showEndGame" : "")}>
      <h2>Game Over</h2>
      <div className='btnRestartGame' onClick={restartGame}>
        Rejouer
      </div>
    </div>
    {/*<Menu/>*/} 
    </div>
    );
}

