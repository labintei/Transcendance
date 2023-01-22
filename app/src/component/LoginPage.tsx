import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './LoginPage.css';
import { getLoginContext } from 'WebSocketWrapper';

enum LogStatus {
  NotLogged,
  twoFA,
  Logged
}

export default function LoginPage() {
  const [logged, setLogged] = useState<LogStatus>(LogStatus.NotLogged);
  const [secret, setSecret] = useState({
    otpauth_url: "",
    base32: "",
  });
  const [usingotp, setUsing] = useState(false);
  const [openWindow, setOpenWindow] = useState(false);
  const login = useContext(getLoginContext);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      setUsing(res.data.twoFASecret !== undefined && res.data.twoFASecret !== null);
      setLogged(LogStatus.Logged);
      login.set(true);
    }).catch(error => {
      // console.log(error);
      login.set(false);
      if (error.status == 401)
        setLogged(LogStatus.NotLogged);
      if (error.status == 403)
        setLogged(LogStatus.twoFA);
    });
  }, []);

  function styleImgAsDiv(src: string) {
    const divStyle = {
      backgroundImage: 'url(' + src + ')',
    };
    return (divStyle)
  }

  function requestLogout() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/logout", {
      withCredentials: true
    }).then(() => {
      setLogged(LogStatus.NotLogged);
      login.set(false);
    }).catch(error => {
      setLogged(LogStatus.NotLogged);
      login.set(false);
      console.log(error);
    });
  }

  return (
    <>
      { logged == LogStatus.Logged ?
        <button onClick={() => requestLogout()}>Log Out</button>
      : logged == LogStatus.NotLogged ?
        <button><a href={process.env.REACT_APP_BACKEND_URL + "auth/42?redirectURL=" + process.env.REACT_APP_WEBSITE_URL + "login"}>Log In</a></button>
      : // LogStatus.2FA
        <input type="text" placeholder="Enter twoFA">TwoFA not synced yet :</input>
      }
      <br></br>
      {
        logged !== LogStatus.Logged ?
          <></>
        : usingotp ?
          <button>Disable 2FA</button>
        :
          <button>Set Up 2FA</button>
      }
    </>
  );
}

// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon