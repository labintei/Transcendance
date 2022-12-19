import React, { useEffect, useState } from 'react';
import { PopupChildProps } from './Popup';

export default function AddFriend(props: PopupChildProps) : JSX.Element {
  let input: HTMLInputElement | null = null;
  const [errorMsg, setError] = useState<string | null>();

  useEffect(() => {
    props.socket.on('error', (data) => setError(data) );

    return (() => {
      props.socket.off('error');
    });
  }, [])

  function onSubmit(e : React.FormEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    input?.focus();
    props.socket.emit('addFriend', {
      ft_login: input?.value,
      name: input?.value
    }, () => {
      props.setPopup(false);
    });
  }

  return (
    <>
      <h1>Add friend : </h1>
      <form>
        <button
          onClick={onSubmit}
        >
          Add friend
        </button>
        <input
          type="input"
          placeholder="Enter username"
          ref={node => input = node}
          required
        >
        </input>
      </form>
      {
        errorMsg === null ? null :
        <p>
          {errorMsg}
        </p>
      }
    </>
  );
}