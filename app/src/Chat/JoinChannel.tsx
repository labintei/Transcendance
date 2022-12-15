import React, { useEffect, useState } from 'react';
import { PopupChildProps } from './Popup';

export default function JoinChannel(props: PopupChildProps) : JSX.Element {
  let input: HTMLTextAreaElement | null = null;
  let keyInput: HTMLInputElement | null = null;
  let keyInputCreate: HTMLInputElement | null = null;
  const [publiclist, setList] = useState([]);
  const [errorMsg, setError] = useState<string>();

  useEffect(() => {
    props.socket.on('publicList', (data) => { console.log(data); setList(data) });
    props.socket.on('error', (data) => {
      setError(data);
      console.log(data);
    });

    props.socket.emit('publicList');
  }, [])

  function onSubmitCreate(e: React.MouseEvent<HTMLElement> | null) {
    let password = null;
    let status = "Public";

    if (e !== null)
      e.preventDefault();
    if (input === null)
      return ;
    input.focus();

    if (keyInputCreate !== null) {
      password = keyInputCreate.value;
      status = "Protected"
    }

    props.socket.emit('create', {
      name: input.value,
      password: password,
      status: status,
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

      onSubmitCreate(null);
    }
  }

  const onSubmitJoinProtected =  (chan: any) => (e: any) => {
    e.preventDefault();
    if (keyInput === null)
      return ;
    let key = keyInput.value;
    join(chan, key);
  }

  const onChanClick =  (chan: any) => (e: any) => {
    console.log("click on chan");
    join(chan, null);
  }

  function join(channel : string, key : string | null) {
    console.log("[DEBUG]");
    props.socket.emit('join', {
      "name": channel,
      "password": key,
    }, (data: any) => {
      console.log("[DEBUG]", data);
    });
  }

  return (
    <>
      <h1>Public channel list : </h1>
      <div>{publiclist.map((chan: any) => (
        <div key={chan.id}>
          { chan.status === "Protected" ?
            <form onSubmit={onSubmitJoinProtected(chan.name)}>
              {chan.name}
              <input type="input" placeholder="key" required={true} ref={node => keyInput = node}/>
              <button type="submit">Join</button>
            </form>
            :
            <>
              {chan.name}
              <button onClick={onChanClick(chan.name)}>Join</button>
            </>
          }
        </div>
      ))}</div>
      <form>
        <button
          onClick={onSubmitCreate}>
          Create channel
        </button>
        <textarea
          rows={1}
          placeholder="test"
          onKeyDown={onKeyDown}
          ref={node => input = node}
          required>
        </textarea>
        <input type="input"
          placeholder="key"
          ref={node => keyInputCreate = node}
        >
        </input>
      </form>
    </>
  );
}