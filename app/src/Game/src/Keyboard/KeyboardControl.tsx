import { useEffect , useContext} from 'react'
import { useStore } from '../State/state'
//import { socket } from '../PongGame'
//mport {socket} from '../PongGame' 
//import { socket } from '../../../App' ;
import { getSocketContext } from 'WebSocketWrapper';

const pressed = [false]

function useKeys(target:any, event:any, up = true) {
  
  const socket = useContext(getSocketContext);
  useEffect(() => {
    const downHandler = (e:any) => {
      
      if (target.indexOf(e.key) !== -1) {
        const isRepeating = !!pressed[e.keyCode]
        pressed[e.keyCode] = true
        if (up || !isRepeating) event(true)
      }
    }

    const upHandler = (e:any) => {
      if (target.indexOf(e.key) !== -1) {
        pressed[e.keyCode] = false
        if (up) event(false)
      }
    }

    window.addEventListener('keydown', downHandler, { passive: true })
    window.addEventListener('keyup', upHandler, { passive: true })
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [target, event, up])
}

export default function KeyBoardControls() 
{
  const role = useStore((s:any) => s.role);
  const id = useStore((s:any) => s.id);
  const set = useStore((state: any) => state.set);

  const Spectator = useStore((s:any) => s.spectator);
  const socket = useContext(getSocketContext);

  useKeys(['ArrowLeft', 'a', 'A'], (left:boolean) => 
  {
    if(left && Spectator == false)
      socket.emit('left', [role,id]);
  })

  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) =>
  { 
    if(right && Spectator == false)
      socket.emit('right', [role,id])
  })
/*
  useKeys(['Escape'], (escape:boolean) =>
  {
      if(escape)
      {
        socket.emit('escape', [role,id])
      }
  })*/useKeys(['Escape'], (escape:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, escape } })))


  return null;
}
