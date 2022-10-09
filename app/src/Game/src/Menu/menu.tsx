import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../State/state";
import "./menu.css"

export default function Menu() {
    // TODO: We do not have to keep esc push to see the menu

    const getEscape: any = useStore((state: any) => state.controls.escape);
    const setEscape:any = useStore((state:any) => state.setEscape);
    const navigate = useNavigate();

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
    <li onClick={() => (navigate("../matching"))}>to do: add list of maps and update zustand</li>
    <li onClick={() => (setStep(0))}>Back</li> 
</> }
                </div>
            </div>
        )
    }
    return null;
}