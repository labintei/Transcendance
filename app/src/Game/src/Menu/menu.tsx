import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../State/state";
import "./menu.css"
import sky from "../Assets/Sky.png"
import space from "../Assets/Space.png"

export default function Menu() {
    // TODO: We do not have to keep esc push to see the menu

    const getEscape: any = useStore((state: any) => state.controls.escape);
    const setEscape:any = useStore((state:any) => state.setEscape);
    const navigate = useNavigate();
    const setTheMap:any = useStore((state:any) => state.setMap);

    function setMap(map:string) {
        if (map === "sky")
            setTheMap("sky")
        if (map === "space")
            setTheMap("space")
    }

    console.log(getEscape)

    const [step, setStep] = useState<number>(0)

    if (getEscape) {
        return (
            <div className="Menu">
                <h1>
                    Menu
                </h1>
                <div className="menu_wrapper">
{ step === 0 && <>
    <li onClick={() => (setEscape())}>Resume</li>
    <li onClick={() => (navigate("../matching"))}>Give up</li>
    <li onClick={() => (setStep(1))}>Options</li> 
</> }

{ step === 1 && <>
    <li onClick={() => (navigate("../matching"))}>Sound</li>
    <li onClick={() => (setStep(step + 1))}>Select map</li>
    <li onClick={() => (setStep(step - 1))}>Back</li> 
</> }

{ step === 2 && <>
    <div className="wrapper">
    <div className="col" onClick={() => (setMap("space"))}>
        <h2>Space</h2>
    <img src={space} />
    </div>
    <div className="col" onClick={() => (setMap("sky"))}>
        <h2>Sky</h2>
    <img src={sky} />
    </div>
    </div>
    <li onClick={() => (setStep(step - 1))}>Back</li> 
</> }
                </div>
            </div>
        )
    }
    return null;
}