import React, { useRef , useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../../State/state";
import { socket } from "Game/src/PongGame";
import { StaticReadUsage } from "three";

//interface 
/*export interface Sphere {
  x:number;
  y:numb
}*/

// Geometry
export default function Sphere() {
  
  const ref = useRef<any>(null!)
  const box1:any = useStore((s:any) => s.box1)
  const box2:any = useStore((s:any) => s.box2)
  const gameNotReady:any = useStore((state:any) => state.setNotReady);
  const ballcolor:any = useStore((state:any) => state.ballColor);

  const x = useStore((s:any) => s.sphere_x);
  const z = useStore((s:any) => s.sphere_z);
  const ready = useStore((s:any) => s.gameReady);

  const setReady:any = useStore((s:any) => s.setReady);
  const setNotReady:any = useStore((s:any) => s.setNotReady);
  
  const addPoint1:any = useStore((state:any) => state.addPoint1);
  const addPoint2:any = useStore((state:any) => state.addPoint2);
  const Spherenew:any = useStore((state:any) => state.Spherenew);
  const Spherex:any = useStore((s:any) => s.Spherex);
  const Spherez:any = useStore((s:any) => s.Spherez);
  const Updatez_dir:any = useStore((s:any) => s.Updatez_dir);
  const Updatex_angle:any = useStore((s:any) => s.Updatex_angle);

  const GetID = useStore((state:any) => state.id);

  const A = useStore((state:any) => state.sphere_x);
  const B = useStore((state:any) => state.sphere_z);

    
  var zdirection = 0.05;
  var l = Math.random();
  console.log(l)
  if (l < 0.5)
    zdirection = -0.05;
  console.log(zdirection)
  var xangle = l *0.1;


  useEffect(() => {
      socket.emit('ball', [GetID, zdirection, l, xangle]);
      ref.current.position.z = A;
      ref.current.position.z = B;
    return () => {
    }
  }, [Updatez_dir, Updatex_angle ,Spherenew, addPoint1, addPoint2, setReady, setNotReady])

  useFrame((state, delta) => { 

    if (!ready)
      return;
    
    //console.log(box1.current.position);
    //socket.emit('sphere', box1 , box2, x , z);
    var c = box1.current.position;
    var d = box2.current.position;
    //socket.emit('sphere', {box1:c, box2:d, x, z});
    //socket.emit('sphere', {box1, box2, x, z});
  })
  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow
    ref={ref}>
      <sphereGeometry attach="geometry" args={[0.5, 24, 24]} />
      <meshBasicMaterial
        attach="material"
        color={ballcolor}
      />
    </mesh>
  );
}
