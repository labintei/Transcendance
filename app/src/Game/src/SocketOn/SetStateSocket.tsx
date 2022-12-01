import { useEffect } from 'react'
import { useStore } from '../State/state'
import { socket } from '../PongGame'


export default function KeyboardControls() {
  const set = useStore((state: any) => state.set)

//   @ts-ignore
  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, right } })))

  return null
}
