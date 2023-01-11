import React from 'react';
import axios from 'axios';
import './LoginPage.css';
import { Link } from 'react-router-dom';

// rajouter ici


import { io, Socket } from "socket.io-client";
/*
import { socket } from '../App' ;
var j:any;
var d:any;*/


export var c:string = "";

const secu_url = process.env.REACT_APP_BACKEND_URL || '';

//export const g = io.connect(secu_url);
//g.on('connect')

/*
export const soc = io(secu_url, {
  query: {
    data: {j}},
  auth: {d}
})*/


// sending credentials section
/*
export const soc = io(secu_url, {
  extraHeaders : {
    Authorization : "1234"
  }
});*/

export const soc = io(secu_url, {
  withCredentials: true,
  //rememberUpgrade: true,
  //transports: ["websocket" , "polling"],// default value
  // par default the HTTP long polling connection first and then Websocket is attempted 
  extraHeaders: {
    l : "pizza"
  },// marche uniquement avec websocket
  query: {
    // already inside EIO, transport sid j t
    auth: {c},
    test: 42// marche comme ca
  }
})

//soc.io.on("open", () => {})



// https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-post
soc.on("connect_error", () => {
  // revert to classic upgrade
  console.log('here');
  soc.io.opts.transports = ["polling", "websocket"];
});

//soc.on('start_serv_get_c', soc.emit('user', c));
// ne remplace pas un handshake


soc.onAny((event, ...args) => {
  console.log(event,args);
})

/*
soc.on('connect', () => {
  console.log('connect');
})*/


// reconnect // ping // reconenct error , reconnect_failed


/*
soc.on("reconnect_attempt", () => {
  console.log("Reconnect attempt")
})
*/

type MyState = {
  auth: number;
}

enum LogStatus {
  NotLogged,
  twoFA,
  Logged,
}

export default class LoginPage extends React.Component {
  state = {
    logged:LogStatus.NotLogged,
    auth: "",
  }
 
  constructor (props:any) {
    super(props);
    //soc.request

    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      console.log('Au niveau du login : ');
      console.log(res.data.ft_login);
      //soc.auth = res.data.ft_login
      this.setState({logged:LogStatus.Logged})
      this.setState({auth:res.data.ft_login})// va le stocker dans le state
      //this.setState((state,props) => { return {auth: res.data.ft_login};});
      //console.log(soc.auth);
      c = res.data.ft_login;
      //console.log('State ' + this.state.auth);
      console.log('C ' + c);
      console.log('state' + this.state.auth)
      //soc.disconnect().connect();
      //soc.on('reconnect_attempt', function () {
      //  soc.io.opts.query = { data: res.data};
      //});
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
