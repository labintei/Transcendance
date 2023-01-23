import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './LoginPage.css';
import { getLoginContext } from 'WebSocketWrapper';
import qrcode from 'qrcode';

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
  const [username, setUsername] = useState("default");
  const [otp, setOtp] = useState("");
  const [otpTest, setOtpTest] = useState("");
  const [usingotp, setUsing] = useState(false);
  const [openWindow, setOpenWindow] = useState(false);
  const login = useContext(getLoginContext);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      setUsing(res.data.twoFASecret !== undefined && res.data.twoFASecret !== null);
      if (res.data.ft_login !== undefined)
        setUsername(res.data.ft_login);
      setLogged(LogStatus.Logged);
      login.set(true);
    }).catch(error => {
      console.log(error);
      login.set(false);
      console.log(error.response.status);
      if (error.response.status == 401)
        setLogged(LogStatus.NotLogged);
      if (error.response.status == 403)
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

  function disable2FA() {
    axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {twoFASecret:null}, {
      withCredentials: true
    }).then(() => {
      setUsing(false);
    }).catch(error => {
      if (error.status == 401 || error.status == 403) {
        setLogged(LogStatus.NotLogged);
        login.set(false);
      }
      console.log(error);
    });
  }

  function enable2FA() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/2FA/" + secret.base32, {
      withCredentials: true,
      params: { twoFAToken: otpTest }
    }).then(res => {
      axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {twoFASecret:secret.base32}, {
        withCredentials: true
      }).then(() => {
        setOpenWindow(false);
        setUsing(true);
      }).catch(error => {
        if (error.status == 401 || error.status == 403) {
          setLogged(LogStatus.NotLogged);
          login.set(false);
        }
        console.log(error);
      });
    }).catch(error => {
      if (error.status == 401 || error.status == 403) {
        setLogged(LogStatus.NotLogged);
        login.set(false);
      }
      console.log(error);
    });
  }

  function validate2FA() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/2FA", {
      withCredentials: true,
      params: { twoFAToken: otp }
    }).then(res => {
      setLogged(LogStatus.Logged);
      setUsing(true);
      login.set(true);
    }).catch(error => {
      if (error.status == 401 || error.status == 403) {
        setLogged(LogStatus.NotLogged);
        login.set(false);
      }
      console.log(error);
    });
  }

  function generate2FA() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/2FASecret", {
      withCredentials: true
    }).then(res => {
      let twoFA:string = res.data;
      let otpurl:string = "otpauth://totp/" + username + "?secret=" + twoFA + "&issuer=Pong3D";
      qrcode.toDataURL(otpurl, (err:any, imageUrl:string) => {
        if (err)
          console.log('Error with QR');
        else {
          setSecret({
            otpauth_url: imageUrl,
            base32: twoFA
          });
          setOpenWindow(true);
        }
      });
    }).catch(error => {
      if (error.status == 401 || error.status == 403) {
        setLogged(LogStatus.NotLogged);
        login.set(false);
      }
      console.log(error);
    });
  }

  return (
    <>
      { logged === LogStatus.Logged ?
        <button onClick={() => requestLogout()}>Log Out</button>
      : logged === LogStatus.NotLogged ?
        <button><a href={process.env.REACT_APP_BACKEND_URL + "auth/42?redirectURL=" + process.env.REACT_APP_WEBSITE_URL + "login"}>Log In</a></button>
      : // LogStatus.2FA
        <input type="text" size={4}
          onChange={event => {
            let query = event.target.value;
            if (query.length <= 6 && query.match("^[0-9]*$"))
              setOtp(query);
            else
              event.target.value = otp;
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              validate2FA();
            }
          }}
        />
      }
      <br></br>
      {
        logged !== LogStatus.Logged ?
          <></>
        : usingotp ?
          <button onClick={disable2FA}>Disable 2FA</button>
        :
          <button onClick={generate2FA}>Set Up 2FA</button>
      }
      <br></br>
      {
        logged !== LogStatus.Logged || !openWindow ?
          <></>
        :
          <div>
            <h3>Two-Factor Authentication (2FA)</h3>
            <p>Scan QRCode</p>
            <img src={secret.otpauth_url}></img>
            <p>Or enter this Code into your app :</p>
            <h4>{secret.base32}</h4>
            <p>To change the settings please validate the authentication code</p>
            <input
              type="text"
              size={4}
              onChange={event => {
                let query = event.target.value;
                if (query.length <= 6 && query.match("^[0-9]*$"))
                  setOtpTest(query);
                else
                  event.target.value = otpTest;
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  enable2FA();
                }
              }}
            /><br/><br/>
            <button onClick={() => setOpenWindow(false)}>Cancel</button>
          </div>
      }
    </>
  );
}

// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon