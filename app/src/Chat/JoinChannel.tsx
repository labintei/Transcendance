import React, { useEffect, useState } from 'react';
import { PopupChildProps } from './Popup';

export default function JoinChannel(props: PopupChildProps) : JSX.Element {
  let input: HTMLTextAreaElement | null = null;
  const [publiclist, setList] = useState([]);
  const [errorMsg, setError] = useState<string>();

  useEffect(() => {
    props.socket.on('publicList', (data) => { console.log(data); setList(data) });
    props.socket.on('error', (data) => setError(data) );

    props.socket.emit('publicList');
  }, [])

  function onSubmit(e: React.MouseEvent<HTMLElement> | null) {
    if (e !== null)
      e.preventDefault();
    if (input === null)
      return ;
    input.focus();
    props.socket.emit('create', {
      status: "Public",
      name: input.value
    }, () => {
      props.socket.emit('joinedList');
      props.setPopup(false);
    });
    console.log("submit form");
    console.log(input?.value);
  }

  function onKeyDown(e: any) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      console.log("submit form");

      onSubmit(null);
    }
  }

  const onChanClick = (e: any) => (chan: any) => {
    // e.preventDefault();
    console.log("click on chan");
    if (chan.status === "Protected") {
    }
  }

  return (
    <>
      <h1>Public channel list : </h1>
      <div>{publiclist.map((chan: any) => (
        <div key={chan.id}>
          {chan.name}
          { chan.status === "Protected" ?
            <input type="password" placeholder="password" /> : null
          }
          <button onClick={onChanClick(chan)}>Join</button>
        </div>
      ))}</div>
      <form>
        <button
          onClick={onSubmit}>
          Create channel
        </button>
        <textarea
          rows={1}
          placeholder="test"
          onKeyDown={onKeyDown}
          ref={node => input = node}>
        </textarea>
      </form>
    </>
  );
}