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
import { SocketAddress } from 'net';

// test
import { socket } from '../../App' ;


// je vais utiliser axios pour envoyer le client de Game vers mon user
import axios from 'axios';

// je pourrais l effacer
export interface Game_data {
  id: number;
  nb_player: number;
  player1: Socket;
  //player2: Socket;
  player1_x: number;
  player2_x: number;
}


//export const socket = io(secu_url);
//export const s = socket


const secu_url = process.env.REACT_APP_BACKEND_URL || '';
//console.log('hear');

//export const socket = io(secu_url);

//export cons

//const options = {};
//export const s = io(secu_url, options);


/*
export default class C extends React.Component
{
  axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
    withCredentials: true
  }).then(res => {})
  .catch(error => {
    console.log('Error');
  });
}*/

// doit etre generer qu une seule fois et rattache au client

// axios.patch('setsOCKETS')


//export class PongGame extends React.Component
//{
export default function PongGame(props: any) {

  //constructor(){
  const getScore:any = useStore((state:any) => state.score);
  const ready = useStore((s:any) => s.gameReady);

  const d:any = useStore((s: any) => s.player1Move);
  const so = useStore((state:any) => state.set);


  // marche po
  var B:any = useStore((s:any)=> s.Player1);// MovePlayer1
  var C:any = useStore((s:any)=> s.Player2);
  
  const c:number = useStore((s:any)=> s.player1_x);
  
  const setRole:any = useStore((s:any)=> s.SetRole);
  const setId:any = useStore((s:any)=> s.SetId);
  //}

  const getId:any = useStore((s:any)=> s.id);


  //var r:any = useStore((s:any) => s.zdir);

 // const sta:any = useStore((s:any)=> s);

  const Setx:any = useStore((s:any)=> s.Setx);
  const Setz:any = useStore((s:any) => s.Setz);
  const SetReady:any = useStore((s:any) => s.SetReady);

  // toujours undefinde
  const h1:any = useStore((s:any) => s.Setcx);
  const h2:any = useStore((s:any) => s.Setcy);
  const h3:any = useStore((s:any) => s.Setcz);
  // avec la var
  var i = useStore((s:any) => s.cx);

  var g:any = useStore((s:any) => s.role);


  const GetTime = useStore((s:any)=> s.time);
  var SetTime:any = useStore((s:any) => s.SetTime);

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
      socket.off('start_game');
    }
  }, [setId, setRole])

  
  useEffect(() => {
    socket.on('newpos', (data) => {Setx(data[0]);Setz(data[1]);B(data[2]);C(data[3]);});
    socket.on('time', (data) => {SetTime(data)});
    return () => {
      socket.off('time');
      socket.off('newpos');
      socket.emit('endgame');
    }
  },[B])

  // je dois pas creer une infiinnite loop
  useEffect(() => {
    //if(ready)
    //socket.emit('ball', getId);
  },[])

  // envoit un socket pour l initialisation

  return (
    <div className="App" tabIndex={0} >
    {<World/>}
    <div className='score'>
      <div className='elem'>
      Time:
      {<div>{/*GetTime*/}</div>}
      Score: 
      {<div>{getScore[0]} - {getScore[1]}</div>}
    </div>
    </div>

    {/*ready === false && <Timer nb={3}/>*/}
    {/*  <Menu/>*/}
    </div>
    );
}

