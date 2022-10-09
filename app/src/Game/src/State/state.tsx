import { createRef } from 'react';
import create from 'zustand';
import {defaultavatar} from "component/const";

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
  gameReady:false,
  votes: 0,
  score: [0,0],
  controls: {
    left: false,
    right: false,
    escape: false
  },
  profile: {
    username: "Default Name",
    avatar_location: defaultavatar,
    rank: 0,
    inMatch: false
  },
  test: "Test",
  box1: createRef(),
  box2: createRef(),
  setProfile: (newp:Profile) => set((state:any) => ({
    profile: {username:newp.uname, avatar_location:newp.a_loc, rank:newp.rank, inMatch:newp.inMatch}
  })),
  changeUsername: (newname:string) => ((state:any) => ({profile:{username:newname}})),
  changeALoc: (newloc:string) => ((state:any) => ({profile:{avatar_location:newloc}})),
  addVotes: () => set((state:any) => ({ votes: state.votes + 1 })),
  addPoint1: () => set((state:any) => ({ score: [state.score[0] + 1, state.score[1]]})),
  addPoint2: () => set((state:any) => ({ score: [state.score[0], state.score[1] + 1]})),
  subtractVotes: () => set((state:any) => ({ votes: state.votes - 1 })),
  addBox: (box:any) => set((state:any) => ({ box1: [state.box[0] + box, state.box[1], state.box[2]] })),
  setReady: () => set((state:any) => ({ gameReady: true })),
  setNotReady: () => set((state:any) => ({ gameReady: false })),
 }
}

);