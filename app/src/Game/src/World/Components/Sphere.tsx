import React, { useRef } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { useStore } from "../../State/state";
import generateRandomFloatInRange from "./Skybox/Utils";


// Geometry
export default function Sphere() {
  const ref = useRef<any>(null!)
  // @ts-ignore
  const box1 = useStore((s) => s.box1)
  // @ts-ignore
  const box2 = useStore((s) => s.box2)

  const ready = useStore((s:any) => s.gameReady)
  
  var direction = 0.1;
  var angle = 0
  // delta = temps de chargement d'une frame par l'OS
  useFrame((state, delta) => { 

    if (!ready)
      return;
    const width = box1.current.geometry.parameters.width;
    var sphereZ = Math.floor( ref.current.position.z );
    var sphereX = Math.round(ref.current.position.x * 10) / 100;
    var box2Pos = box2.current.position
     
    ref.current.position.z += direction;
    ref.current.position.x += angle
    var sphereXInt = Math.round(ref.current.position.x)
    
    console.log(sphereXInt)
    // if collision with a box
    if (sphereZ === box1.current.position.z && 
      ((sphereX >= box1.current.position.x - (width / 2)) && 
      sphereX <= box1.current.position.x + (width / 2)))
    {
      direction = -0.1;
      // TODO: randomize
      angle = generateRandomFloatInRange(0, 0.05)
    }
    if (sphereZ === box2.current.position.z &&
      ((sphereX >= box2.current.position.x - (width / 2)) && 
      sphereX <= box2.current.position.x + (width / 2)))
    {
      direction = +0.05;
      angle = generateRandomFloatInRange(0, 0.05)
    }
    // Collision with border
    if ( sphereXInt === -5 || sphereXInt === 5)
    {
      // angle = 1 -angle;
      // direction = direction *-1;
    } 
    })
  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow
    ref={ref}>
      <sphereGeometry attach="geometry" args={[0.5, 24, 24]} />
      <meshBasicMaterial
        attach="material"
        color="white"
      />
    </mesh>
  );
}
