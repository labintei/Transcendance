import React from 'react';
import axios from 'axios';
import './LoginPage.css';
import { Link } from 'react-router-dom';

// rajouter ici


import { io, Socket } from "socket.io-client";

import { socket } from '../App' ;
var j:any;
var d:any;

const secu_url = process.env.REACT_APP_BACKEND_URL || '';

//export const g = io.connect(secu_url);
//g.on('connect')

export const soc = io(secu_url, {
  query: {
    data: {j}},
  auth: {d}
})

soc.on('connect', () => {
  console.log('connect');
})


// reconnect // ping // reconenct error , reconnect_failed


/*
soc.on("reconnect_attempt", () => {
  console.log("Reconnect attempt")
})
*/

enum LogStatus {
  NotLogged,
  twoFA,
  Logged
}

export default class LoginPage extends React.Component {
  state = {logged:LogStatus.NotLogged}
 

  constructor (props:any) {
    super(props);
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      console.log('Au niveau du login : ');
      console.log(res.data.ft_login);
      d = res.data.ft_login;
      j = res.data.ft_login;
      console.log(j);
      console.log(d);
      this.setState({logged:LogStatus.Logged})
      console.log(soc.auth);
      //soc.disconnect().connect();
      socket.on('reconnect_attempt', function () {
        socket.io.opts.query = { data: res.data};
      });
      soc.emit('verif', res.data.ft_login);
    }).catch(error => {
      console.log(error);
      if (error.status == 401)
        this.setState({logged:LogStatus.NotLogged})
      if (error.status == 403)
        this.setState({logged:LogStatus.twoFA})
    });
  
  }

  styleImgAsDiv(src:string) {
    const divStyle = {
      backgroundImage: 'url(' + src + ')',
    };
    return (divStyle)
  }

  requestLogout() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/logout", {
      withCredentials: true
    }).then(res => {
      this.setState({logged:LogStatus.NotLogged});
    }).catch(error => {
      this.setState({logged:LogStatus.NotLogged});
      console.log(error);
    });
  }

  
  render() {
    return (
        <>
        { this.state.logged == LogStatus.Logged ?
          <button onClick={() => this.requestLogout()}>Log Out</button>
        : (this.state.logged == LogStatus.NotLogged ?
          <button><a href={process.env.REACT_APP_BACKEND_URL + "auth/42?redirectURL=" + process.env.REACT_APP_WEBSITE_URL + "login"}>Log In</a></button>
          :
          <input type="text" placeholder="Enter twoFA">TwoFA not synced yet :</input>
          )
        }</>

    )
  }
}
// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon
