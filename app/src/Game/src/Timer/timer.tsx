import { useFrame } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import { useStore } from "../State/state";
import "./timer.css"

export default function Timer({nb}: any) {

    const gameReady:any = useStore((state:any) => state.setReady);
    
    const [tm, setTm] = useState<number>(nb)

    useEffect(() => {
            const interval = setInterval(() => {
                setTm(nb => nb - 1)
            }, 1000);
            return () => clearInterval(interval);
      }, []);

    if (tm > -1)
    {
        return (
            <div className="timer"> {tm}</div>
        )

    }
    else
    {
        gameReady()
        return null
    }
}