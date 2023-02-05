/* eslint-disable */
import { CubeTextureLoader } from "three";
import * as React from 'react'
import { useRef, useState} from 'react'
import { Canvas, useFrame, extend, useThree, useLoader, } from '@react-three/fiber'
import Plane from './Components/Plane'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ReactThreeFiber } from '@react-three/fiber'
import Sphere from './Components/Sphere'

import KeyboardControls from "../Keyboard/KeyboardControl"
import { useStore } from "../State/state";
import Box1 from "./Components/Box1";
import Box2 from "./Components/Box2";
import { Sky } from "@react-three/drei";
import { Water } from "three/examples/jsm/objects/Water.js";
import waterimg from "./Textures/waternormals.png"
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./World.css"
import PongGame from "../PongGame";
import SkyboxManager from "./SkyboxManager";


// Extend will make OrbitControls available as a JSX element called orbitControls for us to use.
extend({ OrbitControls });
extend({ Water });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

// TODO: lock zoom and unzoom
const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls component.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  // 1. Using the useThree Hook to get a reference to the Three.JS Camera and Canvas Element
  const {
    camera,
    gl: { domElement },
  } = useThree();

  var camposx  = useStore((s:any) => s.cx);
  var camposy = useStore((s:any) => s.cy);
  var camposz = useStore((s:any) => s.cz);

  
  // 2. Plugging The Orbit Controls into the render loop with useFrame
  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls: any = useRef();
  useFrame((state) => {
  camera.position.x = camposx;
  camera.position.y = camposy;
  camera.position.z = camposz;

    controls.current.update()
  });

  // 3. Initializing the Orbit Control
  return <orbitControls
    ref={controls}
    args={[camera, domElement]}
    // enableZoom={false}
    /*
    maxAzimuthAngle={Math.PI / 4}
    maxPolarAngle={Math.PI}
    minAzimuthAngle={-Math.PI / 4}
    minPolarAngle={0}*/
    enableDamping={true}
  />;
};

export default function World(props: any) {

  const [userData, setUserData] = useState<any>(null)

  const map = useStore((s: any) => s.bgdChoice)
  const changePad:any = useStore((s:any) => s.changePadColor);
  const changeBall:any = useStore((s:any) => s.changeBallColor);
  const changeBoard:any = useStore((s:any) => s.changeBoardColor);

  React.useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(async res => {
      const data = res.data;
      setUserData(data);
      if (data.padColor !== undefined)
        changePad(data.padColor);
      if (data.ballColor !== undefined)
        changeBall(data.ballColor);
      if (data.boardColor !== undefined)
        changeBoard(data.boardColor);
      // console.log(data)
    })
    .catch(error => {
      //console.log(error)
    });
  }, [map]);
  let ooo = 0;
  let iii = window.setInterval(function(){
    ooo = Math.random();
  },1000)

  const navigate = useNavigate();
  const location = useLocation();

  return (  

      <div className={location.pathname.slice(0,5) === "/game" ? "canvOk" : "canv"}>
      <Canvas>
{location.pathname.slice(0,5) === "/game" && (
  <>
       <CameraControls />
    <KeyboardControls />
    <ambientLight intensity={0.5} />
    <directionalLight position={[0, 0, 5]} color="red" />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <pointLight position={[-10, -10, -10]} />
    <Box1 position={[0, 0, 5]} />
    <Sphere />
    <SkyboxManager props={props}/>
    <Box2 position={[0, 0, -5]} />
    <Plane position={[0, -0.5, 0]} /> 
  </>
)}
</Canvas>
      </div>

  )

}