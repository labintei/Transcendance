import React, { useEffect, useState } from 'react';
import { PopupChildProps } from './Popup';

export default function JoinChannel(props: PopupChildProps) : JSX.Element {
  let input: HTMLInputElement | null = null;
  let keyInputCreate: HTMLInputElement | null = null;
  const [publiclist, setList] = useState([]);
  const [errorMsg, setError] = useState<string>();

  useEffect(() => {
    props.socket.on('publicList', (data) => { console.log(data); setList(data) });
    props.socket.on('error', (data) => {
      setError(data);
    });

    props.socket.emit('publicList');

    return (() => {
      props.socket.off('publicList');
      props.socket.off('error');
    })
  }, [])

  function onSubmitCreate(e: React.MouseEvent<HTMLElement>) {
    let password = null;
    let status = "Public";

    e.preventDefault();
    e.stopPropagation();
    input?.focus();

    if (keyInputCreate?.value !== "") {
      password = keyInputCreate?.value;
      status = "Protected"
    }

    props.socket.emit('create', {
      name: input?.value,
      password: password,
      status: status,
    }, () => {
      props.socket.emit('joinedList');
      props.setPopup(false);
    });
    console.log("submit form");
    console.log(input?.value);
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

  function listChannel() {
    let keyInput: HTMLInputElement | null = null;

    const onSubmitJoinProtected =  (chan: any) => (e: any) => {
      e.preventDefault();
      if (keyInput === null)
        return ;
      let key = keyInput.value;
      join(chan, key);
    }

    return (
      <>
        {publiclist.map((channel: any) => (
          <div
            key={channel.id}
          >
            { channel.status !== "Protected" ?
              <>
                <>{channel.name}</>
                <button
                  onClick={onChanClick(channel.name)}
                >
                  Join Channel
                </button>
              </>
            : // Protected Channels
              <form
                onSubmit={onSubmitJoinProtected(channel.name)}
              >
                <>{channel.name}</>
                <input
                  type="input"
                  placeholder="channel password"
                  ref={node => keyInput = node}
                  required
                />
                <button
                  type="submit"
                >
                  Join Channel
                </button>
              </form>
            }
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <h1>Public channel list : </h1>
      {listChannel()}
      <form>
        <button
          onClick={onSubmitCreate}>
          Create channel
        </button>
        <input
          type="input"
          placeholder="Channel Name"
          ref={node => input = node}
          required
        />
        <input
          type="input"
          placeholder="Password (optional)"
          ref={node => keyInputCreate = node}
        />
      </form>
    </>
  );
}