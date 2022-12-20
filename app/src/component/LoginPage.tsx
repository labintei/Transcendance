import React from 'react';
import axios from 'axios';
import './LoginPage.css';

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
      this.setState({logged:LogStatus.Logged})
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

  requestLogin() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "auth/42", {
      withCredentials: true
    }).then(res => {
      
    }).catch(error => {
      console.log(error);
    });
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
