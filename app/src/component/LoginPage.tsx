import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LoginPage.css';
import { Link } from 'react-router-dom';

enum LogStatus {
  NotLogged,
  twoFA,
  Logged
}

export default function LoginPage() {
  const [logged, setLogged] = useState<LogStatus>(LogStatus.NotLogged);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(() => {
      setLogged(LogStatus.Logged);
    }).catch(error => {
      // console.log(error);
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

  function requestLogin() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/42", {
      withCredentials: true
    }).then(() => {
    }).catch(error => {
      console.log(error);
    });
  }

  function requestLogout() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/logout", {
      withCredentials: true
    }).then(() => {
      setLogged(LogStatus.NotLogged);
    }).catch(error => {
      setLogged(LogStatus.NotLogged);
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
    </>
  );
}

// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon