import { createRef } from 'react';
import create from 'zustand';
import {defaultavatar} from "component/const";
import { io, Socket } from "socket.io-client";
import { socket, Game_data } from "../PongGame"

type Profile = {
  uname:string,
  a_loc:string,
  rank:number,
  inMatch:boolean
}

/*
export interface Game_data {
  id: number;
  nb_player: number;
  player1: Socket;
  player2: Socket;
  player1_x: number;
  player2_x: number;
}
*/

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

// define the store
export const useStore = create((set,get) => {

  return {
  set,
  get,
  //interface: Game_Data = {},
  map: "space",
  gameReady:false,
  votes: 0,
  score: [0,0],
  controls: {
    left: false,
    right: false,
    escape: false
  },
  data: {//je met toute mes init
    id: 0,
    nb_player: 0,
    player1: socket,
    player1_x : 0,
    player2_x : 0,
  },
  bgdChoice: 0,
  padColor: "#ffffff",
  ballColor: "#ffffff",
  box1: createRef(),
  box2: createRef(),
  setProfile: (newp:Profile) => set((state:any) => ({
    profile: {username:newp.uname, avatar_location:newp.a_loc, rank:newp.rank, inMatch:newp.inMatch}
  })),

/*  eys(['ArrowRight', 'd', 'D'], (right:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, right } })))
  
    useKeys(['Escape'], (escape:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, escape } })))
    return null
  }
*/

  //player1Move: (num:number) => set((state:Game_Data)=>({state,data.player1_x = num})), 
  player1Move: (num:number) => set((state:any)=>({data : [state.data.player1_x = num]})),
  player2Move: (num:number) => set((state:any)=>({data : [state.data.player2_x = num]})),




  changeBgd: (num:number) => set((state:any)=>({bgdChoice:num})),
  changePadColor: (col:string) => set((state:any)=>({padColor:col})),
  changeBallColor: (col:string) => set((state:any)=>({ballColor:col})),
  addVotes: () => set((state:any) => ({ votes: state.votes + 1 })),
  addPoint1: () => set((state:any) => ({ score: [state.score[0] + 1, state.score[1]]})),
  addPoint2: () => set((state:any) => ({ score: [state.score[0], state.score[1] + 1]})),
  subtractVotes: () => set((state:any) => ({ votes: state.votes - 1 })),
  addBox: (box:any) => set((state:any) => ({ box1: [state.box[0] + box, state.box[1], state.box[2]] })),
  setReady: () => set((state:any) => ({ gameReady: true })),
  setNotReady: () => set((state:any) => ({ gameReady: false })),
  setEscape: () => set((state:any) => ({ controls: [state.left, state.right, false]})),
  setMap: (name:any) => set((state:any) => ({map: name}))
 }
}

);