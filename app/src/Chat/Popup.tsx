import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import './Chat.css';

export interface PopupChildProps {
    socket: Socket;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

// interface takes in a function to render
interface PopupProps {
    functionToRender: (props: PopupChildProps) => JSX.Element;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>
    socket: Socket;
}

/*
 *  create channel
 *  emit('create')
 *  ({
 *      name : "name",
 *      status : "public"
 *      password : ""
 *      id ?
 *  })
 * */

export default function Popup(props: PopupProps) {
    function handleClickOutside(e : React.MouseEvent<HTMLElement>) {
        console.log("click outside");
        e.stopPropagation();
        props.setPopup(false);
    }

    function handleClickInside(e : React.MouseEvent<HTMLElement>) {
        console.log("click inside");
        e.stopPropagation();
    }

    return (
        <div
            className="background_popup"
            onClick={handleClickOutside}>
            <div
                className="popup"
                onClick={handleClickInside}>
                {
                    props.functionToRender(
                    {
                      socket: props.socket,
                      setPopup: props.setPopup
                    })
                }
            </div>
        </div>
    );
}