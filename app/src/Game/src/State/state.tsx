import { createRef } from 'react';
import { create }  from 'zustand';

type Profile = {
  uname:string,
  a_loc:string,
  rank:number,
  inMatch:boolean
}

export const useStore = create((set,get) => ({

  logged: false,

  map: "space",
  gameReady:false,
  votes: 0,
  score: [0,0],
  escaped: false,
  controls: {
    left: false,
    right: false,
    escape: false
  },

  spectator : false, 

  cx : 0,
  cy : 3,
  cz : 7,

  role : 0,
  id : 0,


  sphere_x: 0,
  sphere_z: 0,
  
  player2_x: 0,
  player1_x: 0,

  p1x: 0,
  p2x: 0,

  angle_x:0,
  zdir:0,

  time: 0,
  t : 0,

  s: 0,
  sbis: 0,

  bgdChoice: 0,
  padColor: "#ffffff",
  ballColor: "#ffffff",
  box1: createRef(),
  box2: createRef(),
  setProfile: (newp:Profile) => set((state:any) => ({
    profile: {username:newp.uname, avatar_location:newp.a_loc, rank:newp.rank, inMatch:newp.inMatch}
  })),


  Otime: (num:number) => set((state:any)=>({time : num})),

  Setcx: (num:number) => set((state:any)=>({cx : num})),
  Setcy: (num:number) => set((state:any)=>({cy : num})),
  Setcz: (num:number) => set((state:any)=>({cz : num})),
  
  setscore: (num:number) => set((state:any)=>({s : num})),
  setscorebis: (num:number) => set((state:any)=>({sbis : num})),

  SetReady: (bool:boolean) => set((s:any)=>({gameReady: bool})),

  Setx: (num:number) => set((state:any)=>({sphere_x : num})),
  Setz: (num:number) => set((state:any)=>({sphere_z : num})),

  SetId: (num:number) => set((state:any)=>({ id : num})),
  SetRole: (num:number) => set((state:any)=>({ role : num})),


  Updatex_angle: (num:number) => set((s:any)=>({x_angle:num})),
  Updatez_dir: (num:number) => set((s:any)=>({z_dir:num})),

  
  setbis: (num:number) => set((s:any) => ({t : num})),

  Player1: (numt:number) => set((s:any)=>({p1x:numt})),
  Player2: (numt:number) => set((s:any)=>({p2x:numt})),

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
  
  setEscape: () => set((state:any) => ({ escaped: !state.escaped})),
  setMap: (name:any) => set((state:any) => ({map: name})),
  setEscaped: () => set((state:any) => ({ escaped: true})),
  setLogged: (log: boolean) => set((state:any) => ({ logged: log})),
 }
));
