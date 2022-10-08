import { useNavigate } from "react-router-dom";
import { useStore } from "../State/state";
import "./menu.css"

export default function Menu() {

    const getEscape: any = useStore((state: any) => state.controls.escape);
    const navigate = useNavigate();

    console.log(getEscape)

    if (getEscape) {
        return (
            <div className="Menu">
                <h1>
                    Menu
                </h1>
                <div className="menu_wrapper">
                    <li>Resume</li>
                    <li onClick={() => (navigate("../matching"))}>Give up</li>
                    <li>Options</li>
                </div>
            </div>
        )
    }
    return null;
}