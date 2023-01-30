/* eslint-disable */
import { ArrayCamera, CubeTextureLoader } from "three";
import * as THREE from 'three'
import * as React from 'react'
import { useRef, useState , useContext} from 'react'
import { Canvas, useFrame, extend, useThree, useLoader, } from '@react-three/fiber'
import Plane from './Components/Plane'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ReactThreeFiber } from '@react-three/fiber'
import Sphere from './Components/Sphere'
import i1 from "../World/Components/Skybox/corona_ft.png"
import i2 from "../World/Components/Skybox/corona_bk.png"
import i3 from "../World/Components/Skybox/corona_up.png"
import i4 from "../World/Components/Skybox/corona_dn.png"
import i5 from "../World/Components/Skybox/corona_rt.png"
import i6 from "../World/Components/Skybox/corona_lf.png"
import KeyboardControls from "../Keyboard/KeyboardControl"
import { useStore } from "../State/state";
import Box1 from "./Components/Box1";
import Box2 from "./Components/Box2";
import { Sky } from "@react-three/drei";
import { Water } from "three/examples/jsm/objects/Water.js";
import waterimg from "./Textures/waternormals.png"
import axios from "axios";
import { getSocketContext } from 'WebSocketWrapper';
import { setInterval } from "timers/promises";

const loader = new CubeTextureLoader();
// The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
const texture = loader.load([
  i1,
  i2,
  i3,
  i4,
  i5,
  i6,
]);

//import Timer from '../time'

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

function Ocean() {
  const ref: any = useRef()
  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, waterimg)
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = React.useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])
  const config = React.useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
      // @ts-ignore
      format: gl.encoding
    }),
    [waterNormals]
  )
  useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
  // @ts-ignore
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} position={[0, -5, 0]} />
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

// https://codeworkshop.dev/blog/2020-06-14-creating-a-skybox-with-reflections-in-react-three-fiber
function SkyBox() {
  const { scene } = useThree();
  // Set the scene background property to the resulting texture.
  scene.background = texture;
  return null;
}

export default function World(props: any) {





  //const socket = useContext(getSocketContext);
  
  //const [cam, setCam] = useState([0,0,0]);
  
  let role = useStore((s:any) => s.role);

/*
  if (role === 1)
  {
   camposx = 0
   camposy = 3
   camposz = 7
  }
  if (role === 2)
  {
   camposx = 0
   camposy = 5
   camposz = -9
  }*/

  const [userData, setUserData] = useState<any>(null)


  var t = useStore((s:any) => s.time);

  const changePad:any = useStore((s:any) => s.changePadColor);
  const changeBall:any = useStore((s:any) => s.changeBallColor);

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
      console.log(data)
    })
    .catch(error => {
      console.log(error)
    });
  }, []);
  let ooo = 0;
  let iii = window.setInterval(function(){
    ooo = Math.random();
  },1000)
  return (  
    <Canvas>
    <CameraControls />
    <KeyboardControls />
    <ambientLight intensity={0.5} />
    <directionalLight position={[0, 0, 5]} color="red" />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <pointLight position={[-10, -10, -10]} />
    <Box1 position={[0, 0, 5]} />
    <Sphere />

    {userData && userData?.bgdChoice === 0 && 
    <SkyBox /> 
    }
    {userData && userData?.bgdChoice === 1 &&
    <>
    <Ocean />
     <Sky
      sunPosition={[0, 1, 8]}
      inclination={10}
      azimuth={125}
      rayleigh={60}
      turbidity={100}
      mieCoefficient={0.1}
      mieDirectionalG={0.8}
      distance={3000}
      {...props}
    />
    </>
    }
    <Box2 position={[0, 0, -5]} />
    <Plane position={[0, -0.5, 0]} />
  </Canvas>

  )

}