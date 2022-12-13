import React, { useEffect } from 'react';
import './PongGame.css';
import Timer from './Timer/timer';
import World from './World/World';
import {useStore} from './State/state';
import Menu from './Menu/menu';
import { io, Socket } from "socket.io-client";
import { StaticReadUsage } from 'three';
import { convertTypeAcquisitionFromJson, isConstructorDeclaration, setSyntheticLeadingComments } from 'typescript';
import { off } from 'process';


export interface Game_data {
  id: number;
  nb_player: number;
  player1: Socket;
  //player2: Socket;
  player1_x: number;
  player2_x: number;
}

const secu_url = process.env.REACT_APP_BACKEND_URL || '';
export const socket = io(secu_url);


//export class PongGame extends React.Component
//{
export default function PongGame(props: any) {

  //constructor(){
  const getScore:any = useStore((state:any) => state.score);
  const ready = useStore((s:any) => s.gameReady);

  const d:any = useStore((s: any) => s.player1Move);
  const so = useStore((state:any) => state.set);
  const B:any = useStore((s:any)=> s.Player1);// MovePlayer1
  const c:number = useStore((s:any)=> s.player1_x);
  
  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);
  //}

  const getId:any = useStore((s:any)=> s.id);


  const Setx:any = useStore((s:any)=> s.Setx);
  const Setz:any = useStore((s:any) => s.Setz);

  useEffect(() => {
    console.log('START');
    socket.emit('start_game');
    socket.on('start', (data) => {console.log(data[1]);console.log(data[0]);setRole(data[1]);setId(data[0])})
    return () => {
      socket.off('start_game');
    }
  }, [setId, setRole])

  
  useEffect(() => {
    socket.on('box1_x', (data) => {console.log(String(data));B(Math.round(data)/10);});
    //socket.on('')
    //
    socket.on('newpos', (data) => {console.log(String(data[0]) + " " + String(data[1]));Setx(data[0]);Setz(data[1]);});
  },[])

  // envoit un socket pour l initialisation

  return (
    <div className="App" tabIndex={0} >
    {<World/>}
    <div className='score'>
      <div className='elem'>
      Score: 
      {/*<div>{getScore[0]} - {getScore[1]}</div>*/}
    </div>
    </div>

    {/*ready === false &&   <Timer nb={3}/>*/}
    {/*  <Menu/>*/}
    </div>
    );
}

