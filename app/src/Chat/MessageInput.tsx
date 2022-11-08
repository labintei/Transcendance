import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';

interface MessageInputProps {
    socket: Socket | null;
    channelKey: number | null;
}

function MessageInput(props: MessageInputProps) {
    const [name, setName] = useState("");

    const onSubmit = (event : React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();
        alert(`Message was: ${name}`);
    }

    return (
        <div className='messageInput'>
            <form onSubmit={onSubmit}>
                {/* <label>New Message */}
                    <input
                        className="inputBox"
                        type="text"
                        value={name}
                        onChange={(e) => {setName(e.target.value)}}
                    />
                {/* </label> */}
            </form>
        </div>
    );
}

export default MessageInput;