import { createRef } from 'react';
import create from 'zustand';


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
  box1: createRef(),
  box2: createRef(),
  addVotes: () => set((state:any) => ({ votes: state.votes + 1 })),
  subtractVotes: () => set((state:any) => ({ votes: state.votes - 1 })),
  addBox: (box:any) => set((state:any) => ({ box1: [state.box[0] + box, state.box[1], state.box[2]] })),
  setReady: () => set((state:any) => ({ gameReady: true })),
 }
}

);