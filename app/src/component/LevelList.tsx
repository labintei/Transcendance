import React from 'react';
import axios from 'axios';
import './LevelList.css';
import { Navigate } from 'react-router-dom';
import {defaultavatar, acceptedimg} from './const';

type PRank = {
    id: number
    name: string;
    rank: number;
    status: string;
    avatar_location: string;
}

type State = {
  listl:Array<PRank>,
  logged:boolean,
  rank:number,
  username:string
}

export default class LevelList extends React.Component {
  state:State;

  constructor (props:any) {
    super(props);
    this.state = {listl:[], logged:true, rank:42, username:""};
    this.requestUser();
  }

  requestUser() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      if (res.data.rank !== undefined && res.data.username !== undefined)
        this.setState({rank:res.data.rank, username:res.data.username});
    }).catch(error => {
      this.setState({logged:false});
    });
  }

  componentDidMount() {
    let str = (this.state.rank < 11 ? "ranking/user" : "ranking/")
    axios.get(process.env.REACT_APP_BACKEND_URL + str, {
      withCredentials: true,
      params: {count:10}
    }).then(async res => {
        const pranks = res.data;
        console.log(res);
        let listtmp: Array<PRank> = [];
        let i = 1;
        for (var prank of pranks) {
            let one: PRank = {id: 0, name: '', rank: 50, avatar_location:defaultavatar, status:""};
            if (prank.username !== undefined && prank.level !== undefined) {
                one.id = i;
                one.name = prank.username;
                one.rank = i++;
                if (prank.status !== undefined)
                  one.status = prank.status;
                if (prank.avatarURL !== undefined && prank.avatarURL !== null && '' !== prank.avatarURL)
                {
                  if (acceptedimg.includes(prank.avatarURL))
                    await axios.get(process.env.REACT_APP_BACKEND_URL + "avatar/" + one.name, {
                        withCredentials: true,
                        responseType:'blob'
                      }).then(res => {
                        one.avatar_location = URL.createObjectURL(res.data);
                      }).catch(error => {
                        if (error.response.status === 401 || error.response.status === 403)
                          this.setState({logged:false});
                      });
                  else
                    one.avatar_location = prank.avatarURL;
                }
                listtmp.push(one);
            }
        }
        console.log(listtmp);
        this.setState({listl: listtmp});
      }).catch(error => {
        console.log(error);
      })
  }

  challengeClicked(id:number) {
    console.log(id);
  }

  render_score(score:number) {
    if (score === 1)
      return ("Champion")
    if (score === 2)
      return ("2nd")
    else if (score === 3)
      return ("3rd")
    else
      return (score + "th")
  }

  div_score(rank:number) {
    if (rank === 1)
      return ("gold-rank")
    else if (rank === 3)
      return ("bronze-rank")
    else if (rank === 2)
      return ("silver-rank")
    else
      return ("low-rank")
  }

  challenge_available(status:string, id:number, name:string) {
    if (status === "Online" && name !== this.state.username)
      return (
        <button onClick={() => this.challengeClicked(id)}  id="challenge-button"></button>
      )
    else
        return (<img alt="challenge unavailable" src="/challenge_unavailable.png"></img>)
  }

  renderStatus (s:string) {
    if (s === "Offline" || s === "Online" || s === "Playing")
      return (s)
    else
      return ("Offline")
  }

  styleImgAsDiv(src:string) {
    const divStyle = {
      backgroundImage: 'url(' + src + ')',
    };
    return (divStyle)
  }

  render() {
    return (
      <>
        {this.state.logged ? <></> : <Navigate to="/login"></Navigate>}
        <ul id="level-list">
        {
          this.state.listl.map(prank =>
              <li key={prank.id} className={this.div_score(prank.rank)}>
                <p>{this.render_score(prank.rank)}</p>
                <div className='avatar' style={this.styleImgAsDiv(prank.avatar_location)}><span title={prank.status} className={this.renderStatus(prank.status)}></span></div>
                <p>{prank.name}</p>
                {this.challenge_available(prank.status, prank.id, prank.name)}
              </li>
            )
        }
      </ul>
      </>
    )
  }
}
