import React, { useEffect, useState } from 'react';
import Popup, { PopupChildProps } from './Popup';

export default function InviteChannel(props: PopupChildProps) : JSX.Element {
  let input: HTMLInputElement | null = null;
  const [errorMsg, setError] = useState<string>();
  const [popup, setPopup] = useState<boolean>(false);

  useEffect(() => {
    props.socket.on('error', (data) => setError(data) );
    setPopup(false);
  }, [])

  function onSubmit(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    input?.focus();
    props.socket.emit('invite');
    // props.socket.emit('invite', {
    //   name: input,
    //   ft_login: input,
    //   channel: props.chanName
    // });
    console.log("invite friend");
    console.log(input?.value);

    props.setPopup(false);
  }

  return (
    <>
      <h1>Invite to Channel : </h1>
      <form>
        <button
          onClick={onSubmit}>
          Invite to channel
        </button>
        <input
          placeholder='name'
          required={true}
          ref={node => input = node}
        />
      </form>
      {errorMsg}
    </>
  );
}