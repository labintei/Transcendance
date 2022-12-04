import React, { useRef , useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../../State/state";
import { socket } from "Game/src/PongGame";

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
  const ready = useStore((s:any) => s.gameReady)
  const addPoint1:any = useStore((state:any) => state.addPoint1);
  const addPoint2:any = useStore((state:any) => state.addPoint2);
  
  useEffect(() => {
    //socket.on('rendering', () => {console.log('changes les var')});
    //socket.on('wait_game', () => { console.log('recu');socket.emit('game')});
    //socket.on('game_mess', () => { console.log('recu');});
    //socket.on('player1_move', (data) => {console.log(data);B(data); console.log(c)});

    return () => {
    }
  }, [])


  var zdirection = 0.05;
  var l = Math.random();
  console.log(l)
  if (l < 0.5)
    zdirection = -0.05;
  console.log(zdirection)
  var xangle = l *0.1;
  // delta = temps de chargement d'une frame par l'OS
  useFrame((state, delta) => { 
    // todo: randomize angles and increase fast when touched

    if (!ready)
      return;
    // box1, box2, x, y , z
    // la voir pour la sphere (techniquement seule x et z se deplace)
    socket.emit('sphere', box1 , box2, x , z);
    
    const width = box1.current.geometry.parameters.width;
    var sphereZ = Math.floor( ref.current.position.z );
    var sphereX = Math.round(ref.current.position.x * 10) / 100;
    var box2X = Math.round(box2.current.position.x * 10) / 100;
    var box1X = Math.round(box1.current.position.x * 10) / 100;
    var good_width = Math.round((width / 2) * 10) / 100;
     
    ref.current.position.z += zdirection;
    ref.current.position.x += xangle
    var sphereXInt = Math.round(ref.current.position.x)
    
    // ? DESCELERATION
    if (zdirection > 0.1)
      zdirection -= 0.005
    if (zdirection < (-0.1))
      zdirection += 0.005;

    //! Collision with a box
    // console.log(sphereZ)
    // console.log(sphereX)
    // console.log(box1.current.position.z)
    // console.log(box1X)
      
    if ((sphereZ === (box1.current.position.z - 1)) &&
      ((sphereX >= (box1X - good_width)) && 
      (sphereX <= (box1X + good_width))))
    {
      zdirection = -0.3;
    }
    if (sphereZ === box2.current.position.z &&
      ((sphereX >= (box2X - good_width)) && 
      (sphereX <= (box2X + good_width))))
    {
      zdirection = +0.3;
      // xangle = generateRandomFloatInRange(0, 0.05)
    }
    //! Collision with border probleme deplacement pas necessairement precis
    if ( sphereXInt === -5 || sphereXInt === 5)
    {
      console.log("collision!")
      // todo: animation uppon collision
      xangle = -xangle;
    } 

    if (sphereZ > 7 || sphereZ < -7)
    {
      console.log("ball lost!!")
      ref.current.position.z = 0;
      ref.current.position.x = 0;
      if (sphereZ > 7)
        addPoint1()
      else
        addPoint2()
      gameNotReady();  
    }
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
