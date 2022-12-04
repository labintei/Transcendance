import React from 'react';
import axios from 'axios';
import './MatchList.css';
import {defaultavatar} from "./const";
import { Navigate } from 'react-router-dom';

type Match = {
    id: number;
    statusopp: number;
    name: string;
    avatar_loc: string;
    score1: number;
    score2: number;
}

type State = {
  logged: boolean,
  listp:Array<Match>,
  avatar_loc:string,
  avatars:Map<string, string>,
  username:string
}

export default class MatchList extends React.Component {
  state:State;

  requestUser() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      const data = res.data;
      let usrname:string = "";
      if (data.username !== undefined) {
        usrname = data.username;
      }
      if (data.avatarURL !== undefined){
        axios.get(process.env.REACT_APP_BACKEND_URL + "avatar", {
          withCredentials: true,
          responseType:'blob'
        }).then(res => {
          this.setState({username:usrname, avatar_loc:URL.createObjectURL(res.data)});
        }).catch(error => {
          if (error.response.status === 401)
            this.setState({logged:false});
          else
            this.setState({username:usrname});
        });
      } else
        this.setState({username:usrname});
      this.getMatches();
    }).catch(error => {
      this.setState({logged:false});
    });
  }

  constructor (props:any) {
    super(props);
    this.state= {listp:[], logged:true, avatar_loc:defaultavatar, username:"", avatars:new Map()};
    this.requestUser();
  }

  getMatches() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "match/history", {
      withCredentials: true
    }).then(async res => {
        const matchs = res.data;
        console.log(matchs);
        let listtmp: Array<Match> = [];   
        let i = 0;
        for (var match of matchs) {
            let one: Match = {
              id: 0, statusopp: 1, name: '', score1:0, score2:0, avatar_loc:defaultavatar
            };
            let avatar;
            let isOne:boolean = true;
            if (match.id !== undefined && match.score1 !== undefined && match.score2 !== undefined) {
                one.id = match.id;
                if (match.user1 !== undefined && match.user2 !== undefined  && match.user1.username !== undefined && match.user2.username !== undefined) {
                  if (match.user1.username !== this.state.username)
                    isOne = false;
                  one.name = (isOne ? match.user2.username : match.user1.username);
                }
                one.score1 = (isOne ? match.score1 : match.score2);
                one.score2 = (isOne ? match.score2 : match.score1);
                if ('' !== (isOne ? match.user2.avatarURL : match.user1.avatarURL) && 
                null !== (isOne ? match.user2.avatarURL : match.user1.avatarURL))
                {
                  let already = this.state.avatars.get(one.name);
                  if (already === undefined)
                    await axios.get(process.env.REACT_APP_BACKEND_URL + "avatar/" + one.name, {
                      withCredentials: true,
                      responseType:'blob'
                    }).then(res => {
                      one.avatar_loc = URL.createObjectURL(res.data);
                      this.state.avatars.set(one.name, one.avatar_loc);
                    }).catch(error => {
                      if (error.response.status === 401)
                        this.setState({logged:false});
                    });
                  else
                    one.avatar_loc = already;
                }
                listtmp.push(one);
            }
            i++;
        }
        this.setState({listp: listtmp});
        console.log(this.state);
      })
  }

  challengeClicked(name:string) {
    console.log(name);
  }

  friendManage(id:number) {
    console.log(id);
  }

  render_status(score1:number, score2:number) {
    if (score1 > score2)
      return ("Win-div")
    else if (score1 < score2)
      return ("Lose-div")
    else
      return ("Draw-div")
  }

  styleImgAsDiv(src:string) {
    const divStyle = {
      backgroundImage: 'url(' + src + ')',
    };
    return (divStyle)
  }

  renderStatus (s:number) {
    if (s === 0) {
      return ("Offline")
    } else if (s === 1)
      return ("Online")
    else
      return ("Playing")
  }

  challenge_available(status:number, id:string) {
    if (status === 1)
      return (
        <button onClick={() => this.challengeClicked(id)}  id="challenge-button"></button>
      )
    else
        return (<img alt="challenge unavailable" src="/challenge_unavailable.png"></img>)
  }

  render_list(list:Array<Match>) {
    if (list.length === 0)
      return (<p>You have played no match on the server for now.</p>)
    else
      return (
        <ul id="match-list">
        {
        list.map(match =>
            <li key={match.id}>
                <div className={this.render_status(match.score1, match.score2)}>
                <div className='avatar' style={this.styleImgAsDiv(this.state.avatar_loc)}></div>
                  <p>You</p>
                  <p className='score1'>{match.score1}</p>
                </div>
                {this.challenge_available(match.statusopp, match.name)}
                <div className={this.render_status(match.score2, match.score1)}>
                  <p className='score2'>{match.score2}</p>
                  <p>{match.name}</p>
                  <div className='avatar' style={this.styleImgAsDiv(match.avatar_loc)}><span className={this.renderStatus(match.statusopp)}></span></div>
                
                </div>
            </li>
            )
        }
        </ul>
      )
  }

  render() {
    return (
      <>
        {this.state.logged ? <></> : <Navigate to="/login"></Navigate>}
        {
          this.render_list(this.state.listp)
        }
      </>
    )
  }

}