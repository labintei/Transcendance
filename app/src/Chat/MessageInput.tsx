import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';

interface MessageInputProps {
    socket: Socket | null;
    channelKey: number | null;
}

function MessageInput(props: MessageInputProps) {
    let input: HTMLTextAreaElement | null = null;

    // const onSubmit = (event : React.KeyboardEvent<HTMLElement> ) => {
    //     event.preventDefault();
    //     alert(`Message was: ${name}`);
    // }

    const keyHandler = (event : React.KeyboardEvent<HTMLElement>) => {
        if (!props.socket)
            return ;

        if (event.key === "Enter") { // enter key
            event.preventDefault();
            event.stopPropagation();

            // if (!props.channelKey)
                // return ;

            if (!input || !input.value)
                return ;

            console.log("[DEBUG][%s]", input.value);

            props.socket.emit("message", {
                content: input.value,
                channel: props.channelKey,
            },
            (data: any) => {console.log(data)});
            input.value = '';
        }
    }

    return (
        <div className='messageInput'>
            <form>
                {/* <label>New Message */}
                    <textarea
                        className="inputBox"
                        placeholder="Enter message"
                        onKeyDown={keyHandler}
                        ref={node => input = node}
                    />
                {/* </label> */}
            </form>
        </div>
    );
}

export default MessageInput;