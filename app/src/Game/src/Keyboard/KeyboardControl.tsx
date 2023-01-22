import { useEffect } from 'react'
import { useStore } from '../State/state'
//import { socket } from '../PongGame'
import {socket} from '../PongGame' 
//import { socket } from '../../../App' ;

const pressed = [false]

function useKeys(target:any, event:any, up = true) {
  useEffect(() => {


/*    var i = setInterval(() => {
      this.s.get(id).time += 1;
      console.log('Time ' + String(this.s.get(id).time));// penser a clear l interval
  }, 1000)
*/
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
  const set = useStore((state: any) => state.set)

  useKeys(['ArrowLeft', 'a', 'A'], (left:boolean) => 
  {
    if(left)
    {
      socket.emit('left', [role,id]);
    }
  })

  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) =>
  { 
    if(right)// envoyer le role et l iddelaroom
    {
      socket.emit('right', [role,id])
    }

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
