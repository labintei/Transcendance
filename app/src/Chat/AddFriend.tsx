import React, { useEffect, useState } from 'react';
import Popup, { PopupChildProps } from './Popup';

export default function AddFriend(props: PopupChildProps) : JSX.Element {
  let input: HTMLTextAreaElement | null = null;
  const [errorMsg, setError] = useState<string>();
  const [popup, setPopup] = useState<boolean>(false);

  useEffect(() => {
    props.socket.on('error', (data) => setError(data) );
    setPopup(false);
  }, [])

  function onSubmit(e: React.MouseEvent<HTMLElement> | null) {
    if (e !== null)
      e.preventDefault();
    if (input === null)
      return ;
    input.focus();
    props.socket.emit('addFriend', input.value);
    console.log("add friend");
    console.log(input?.value);

    props.setPopup(false);
  }

  function onKeyDown(e: any) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      console.log("add friend");

      onSubmit(null);
    }
  }

  return (
    <>
      <h1>Add friend : </h1>
      <form>
        <button
          onClick={onSubmit}>
          Add friend
        </button>
        <textarea
          rows={1}
          placeholder="Enter username"
          onKeyDown={onKeyDown}
          ref={node => input = node}>
        </textarea>
      </form>
    </>
  );
}