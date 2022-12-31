import { useEffect } from 'react'
import { useStore } from '../State/state'
import { socket } from '../PongGame'

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
        console.log(e.key)
        console.log(target)
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

  const data = useStore((s:any) => s.player1_x);
  const role = useStore((s:any) => s.role);
  const id = useStore((s:any) => s.id);
  //const box = useStore((s: any) => s.box2)
  const set = useStore((state: any) => state.set)

  useKeys(['ArrowLeft', 'a', 'A'], (left:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, left } })))
  useKeys(['ArrowRight', 'd', 'D'], (right:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, right } })))
  useKeys(['Escape'], (escape:boolean) => set((state:any) => ({ ...state, controls: { ...state.controls, escape } })))

/*
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

  useKeys(['Escape'], (escape:boolean) =>
  {
      if(escape)
      {
        socket.emit('escape', [role,id])
      }
  })
*/
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