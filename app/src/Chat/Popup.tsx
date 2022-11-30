import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from './Channel';
import './Chat.css';

export enum popupType {
    JoinChannelPopup,
    AddFriendPopup,
    None
}

interface PopupProps {
    popup: popupType;
    setPopup: React.Dispatch<React.SetStateAction<popupType>>
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
    let input: HTMLTextAreaElement | null = null;
    const [errorMsg, setError] = useState<string>();
    const [publiclist, setList] = useState([]);

    useEffect(() => {
        props.socket.on('publiclist', (data) => { setList(data) });
        props.socket.on('error', (data) => console.log(data) );

        props.socket.emit('publiclist');

        setError("bobby bob");
    }, [])

    function handleClickOutside() {
        props.setPopup(popupType.None);
    }

    function handleClickInside(e : React.MouseEvent<HTMLElement>) {
        e.stopPropagation();
    }

    function onKeyDown(e: any) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();

            console.log("submit form");

            if (props.popup === popupType.AddFriendPopup)
                onSubmit(null, 'addFriend');
            if (props.popup === popupType.JoinChannelPopup)
                onSubmit(null, 'create');
        }
    }

    const sleep = (ms : number) => new Promise(
        resolve => setTimeout(resolve, ms)
      );

    async function onSubmit(e: React.MouseEvent<HTMLElement> | null, signal: string) {
        if (e !== null)
            e.preventDefault();

        if (input === null)
            return ;
        console.log(input.value);
        input.focus();
        if (signal === 'create') {
            const test = {
                "name": input.value,
                "password": "",
                "status": "Public"
            }
            props.socket.emit(signal, test);
            props.socket.emit('joinedList');
        }
        else
            props.socket.emit(signal, input.value);
        input.value = '';

        // setError("success !");

        // await sleep(2000);

        // // close popup
        props.setPopup(popupType.None);
    }

    function renderJoinChannel() {
        return (
        <>
            <h1>Public channel list : </h1>
            <div>{publiclist.map((chan: Channel) => (
                <span>
                    {chan.name}
                </span>
            ))}</div>
            <form>
                <button
                    onClick={(e) => { onSubmit(e, 'createChan') }}>
                    Create channel
                </button>
                <textarea
                    rows={1}
                    placeholder="test"
                    onKeyDown={onKeyDown}
                    ref={node => input = node}>
                </textarea>
            </form>
            </>);
    }

    function renderAddFriend() {
        return (
        <>
            <h1>Add friend : </h1>
            <form>
                <button
                    onClick={(e) => { onSubmit(e, 'addFriend') }}>
                    Add friend
                </button>
                <textarea
                    rows={1}
                    placeholder="Enter username"
                    onKeyDown={onKeyDown}
                    ref={node => input = node}>
                </textarea>
            </form>
            <p className="error">
                { errorMsg }
            </p>
        </>
        );
    }

    return (
        <div
            className="background_popup"
            onClick={handleClickOutside}>
            <div
                className="popup"
                onClick={handleClickInside}>
                {
                    props.popup === popupType.JoinChannelPopup
                    ? renderJoinChannel()
                    : renderAddFriend()
                }
            </div>
        </div>
    );
}
// componentWillMount()
// { document.addEventListener("click", this.handleClickOutside, false); }