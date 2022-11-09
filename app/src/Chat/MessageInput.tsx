import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';

interface MessageInputProps {
    socket: Socket | null;
    channelKey: number | null;
}

function MessageInput(props: MessageInputProps) {
    const [name, setName] = useState("");

    const onSubmit = (event : React.KeyboardEvent<HTMLElement> ) => {
        event.preventDefault();
        alert(`Message was: ${name}`);
    }

    const keyHandler = (event : React.KeyboardEvent<HTMLElement>) => {
        if (!props.socket) return ;
        if (event.key === "Enter") { // enter key
            if (!props.channelKey) return ;
            props.socket.emit("message",
                {"channel":props.channelKey, "message": name});
            setName("");
        }
    }

    return (
        <div className='messageInput'>
            <form>
                {/* <label>New Message */}
                    <textarea
                        className="inputBox"
                        value={name}
                        onChange={(e) => {
                            if (e.target.value === "\n")
                                return ;
                            setName(e.target.value)
                        }}
                        onKeyDown={keyHandler}
                    />
                {/* </label> */}
            </form>
        </div>
    );
}

export default MessageInput;