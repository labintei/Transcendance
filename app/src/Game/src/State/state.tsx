import { createRef } from 'react';
import create from 'zustand';
//import { socket, Game_data } from "../PongGame"

type Profile = {
  uname:string,
  a_loc:string,
  rank:number,
  inMatch:boolean
}


// define the store
export const useStore = create((set,get) => {

  return {
  set,
  get,
  //interface: Game_Data = {},
  map: "space",
  //gameReady:false,
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
    player1 : null,
    //player1: socket,
    player1_x : 0,
    player2_x : 0,
  },

  // position par default

  cx : 0,
  cy : 3,
  cz : 7,


  // Variable socket
  role : 0,//par default
  id : 0,//pardefault
  //room : [0,0],

  sphere_x: 0,// initalisatio
  sphere_z: 0,
  
  player2_x: 0,
  player1_x: 0,

  p1x: 0,
  p2x: 0,

  angle_x:0,
  zdir:0,

  time: 0,

  bgdChoice: 0,
  padColor: "#ffffff",
  ballColor: "#ffffff",
  box1: createRef(),
  box2: createRef(),
  setProfile: (newp:Profile) => set((state:any) => ({
    profile: {username:newp.uname, avatar_location:newp.a_loc, rank:newp.rank, inMatch:newp.inMatch}
  })),

  // ne marcha po
  Setcx: (num:number) => set((state:any)=>({cx : num})),
  Setcy: (num:number) => set((state:any)=>({cy : num})),
  Setcz: (num:number) => set((state:any)=>({cz : num})),
  getAll: () => this,
/*  eys(['ArrowRight', 'd', 'D'], (right:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, right } })))
  
    useKeys(['Escape'], (escape:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, escape } })))
    return null
  }
*/
  //Getcamerapos:number[] : (s:any) => {return [s.]};

  SetReady: (num:number) => set((s:any)=>({gameReady: true})),

  Setx: (num:number) => set((state:any)=>({sphere_x : num})),
  Setz: (num:number) => set((state:any)=>({sphere_z : num})),

  SetId: (num:number) => set((state:any)=>({ id : num})),
  SetRole: (num:number) => set((state:any)=>({ role : num})),
  //SetRoom: (num:number, num1:number) => set ((s:any) => ({room: [s.room[0]:num]; room: [s.room[0]:num]}))

  //player1Move: (num:number) => set((state:Game_Data)=>({state,data.player1_x = num})),
  // marche pas 
  player1Move: (num:number) => set((state:any)=>({data : [state.data.player1_x = num]})),
  player2Move: (num:number) => set((state:any)=>({data : [state.data.player2_x = num]})),

  // mes fonctions

  Updatex_angle: (num:number) => set((s:any)=>({x_angle:num})),
  Updatez_dir: (num:number) => set((s:any)=>({z_dir:num})),


  // ne fonctionne pas
  
  Player1: (numt:number) => set((s:any)=>({p1x:numt})),
  Player2: (numt:number) => set((s:any)=>({p2x:numt})),


  //Player2: (num:number) => set((s:any)=>({player2_x:num})),
  Spherex: (numx:number) => set((s:any) => ({sphere_x:numx})),
  Spherey: (numy:number) => set((s:any) => ({spherez:numy})),
  Spherenew: (numx:number, numy:number) => set((s:any) => ({sphere_x:numx,sphere_z:numy})),

  // Pour le time
  //addTime: () => set((s:any) => ({s.time: s.time + 1})),
  SetTime: (num:number) => set((s:any) => ({time: num})),

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
