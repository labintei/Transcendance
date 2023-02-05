import { useFrame, useLoader, useThree } from "@react-three/fiber";
import axios from "axios";
import React, { useRef, useState } from "react";
import { CubeTextureLoader } from "three";
import i1 from "../World/Components/Skybox/corona_ft.png"
import i2 from "../World/Components/Skybox/corona_bk.png"
import i3 from "../World/Components/Skybox/corona_up.png"
import i4 from "../World/Components/Skybox/corona_dn.png"
import i5 from "../World/Components/Skybox/corona_rt.png"
import i6 from "../World/Components/Skybox/corona_lf.png"
import * as THREE from 'three'
import waterimg from "./Textures/waternormals.png"
import { Sky } from "@react-three/drei";

export default function SkyboxManager(props:any)
{
  const [userData, setUserData] = useState<any>(null)

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

// https://codeworkshop.dev/blog/2020-06-14-creating-a-skybox-with-reflections-in-react-three-fiber
function SkyBox() {
  const { scene } = useThree();
  // Set the scene background property to the resulting texture.
  scene.background = texture;
  return null;
}


  React.useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(async res => {
      const data = res.data;
      setUserData(data); 
      // console.log(data)
    })
    .catch(error => {
      //console.log(error)
    });
  }, []);

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

  if (userData && userData?.bgdChoice === 0)
    return(
<>
    <SkyBox /> 

</>
    )
    else
return (<>
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
</>)
    
}