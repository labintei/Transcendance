import React from 'react';
import axios from 'axios';
import './LoginPage.css';

import { io} from "socket.io-client";
import { socket } from 'App';


const secu_url = process.env.REACT_APP_BACKEND_URL || '';

var y = 56;

var c = {}

export const soc = io(secu_url, {
  withCredentials: true,
  extraHeaders: {
    l : "pizza",
    auth : "",
  },
  query: {
    auth: c,
    other: {y},
    test: 42
  }
})

soc.on("connect_error", () => {


  soc.io.opts.transports = ["polling", "websocket"];
});

soc.on('connect', async () => {
  const donnes = await axios.get(process.env.REACT_APP_BACKEND_URL + "user", {withCredentials: true}).then((res) => res.data.ft_login)
  socket.emit('useremit', donnes);
})



enum LogStatus {
  NotLogged,
  twoFA,
  Logged,
}

export default class LoginPage extends React.Component {
  
  //const [auth, setauth] = React.useState(0);

  state = {
    logged:LogStatus.NotLogged,
    //auth: ,
  }
 
  constructor (props:any) {
    super(props);
    //soc.request

    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      console.log('Au niveau du login : ');
      console.log(res.data.ft_login);
      c = res.data.ft_login
      console.log(c);
      this.setState({logged:LogStatus.Logged})
      soc.emit('verif', res.data.ft_login);
    }).catch(error => {
      console.log(error);
      if (error.status === 401)
        this.setState({logged:LogStatus.NotLogged})
      if (error.status === 403)
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
        { this.state.logged === LogStatus.Logged ?
          <button onClick={() => this.requestLogout()}>Log Out</button>
        : (this.state.logged === LogStatus.NotLogged ?
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
