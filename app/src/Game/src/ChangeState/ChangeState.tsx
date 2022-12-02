import { useEffect } from 'react'
import { useStore } from '../State/state'
import { socket } from '../PongGame'

const pressed = [false]

function useSockets(d:any) {
  useEffect(() => {
      const playermove = () => {
        socket.on('player1_move', (data) => {d(data)});
      }
    }, [d])
}

export default function SocketControls() 
{
  const d = useStore((s:any) => s.data.player1_x);
  useSockets((d));
  return null;
}



/*export default function KeyboardControls() {
  const set = useStore((state: any) => state.set)
*/
  
  /*useKeys(['ArrowLeft', 'a', 'A'], (left:boolean)) => set((state:any) )
  {
      if(left === true)
        socket.emit('left')
      else
        socket.emit('end_left');
  }*/
//   @ts-ignore
/*  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, right } })))

  useKeys(['Escape'], (escape:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, escape } })))
  return null
}*/