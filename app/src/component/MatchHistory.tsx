import React from 'react';
import axios from 'axios';
import './MatchList.css';
import {ChallengeButton, defaultavatar} from "./const";
import { Navigate } from 'react-router-dom';

type Match = {
    id: number;
    statusopp: string;
    name: string;
    avatar_loc: string;
    score1: number;
    score2: number;
}

type State = {
  logged: boolean,
  listp:Array<Match>,
  avatar_loc:string,
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
      if (data.avatarURL && data.avatarURL !== ''){
          this.setState({username:usrname, avatar_loc:data.avatarURL});
      } else
        this.setState({username:usrname});
      this.getMatches();
    }).catch(error => {
      this.setState({logged:false});
    });
  }

  constructor (props:any) {
    super(props);
    this.state= {listp:[], logged:true, avatar_loc:defaultavatar, username:""};
    this.requestUser();
  }

  getMatches() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "match/history", {
      withCredentials: true
    }).then(async res => {
        const matchs = res.data;
        // console.log(matchs);
        let listtmp: Array<Match> = [];
        for (var match of matchs) {
            let one: Match = {
              id: 0, statusopp: "Offline", name: '', score1:0, score2:0, avatar_loc:defaultavatar
            };
            let isOne:boolean = true;
            if (match.id !== undefined && match.score1 !== undefined && match.score2 !== undefined) {
                one.id = match.id;
                if (match.user1 !== undefined && match.user2 !== undefined  && match.user1.username !== undefined && match.user2.username !== undefined) {
                  if (match.user1.username !== this.state.username)
                    isOne = false;
                  one.name = (isOne ? match.user2.username : match.user1.username);
                  if ((isOne ? match.user2.isOnline : match.user1.isOnline))
                    one.statusopp = "Online";
                  if ((isOne ? match.user2.ongoingMatchId : match.user1.ongoingMatchId))
                    one.statusopp = "Playing";
                }
                one.score1 = (isOne ? match.score1 : match.score2);
                one.score2 = (isOne ? match.score2 : match.score1);
                if ('' !== (isOne ? match.user2.avatarURL : match.user1.avatarURL) && 
                null !== (isOne ? match.user2.avatarURL : match.user1.avatarURL))
                {
                    one.avatar_loc = (isOne ? match.user2.avatarURL : match.user1.avatarURL);
                }
                listtmp.push(one);
            }
        }
        this.setState({listp: listtmp});
        // console.log(this.state);
      })
  }

  challengeClicked(name:string) {
    // console.log(name);
  }

  friendManage(id:number) {
    // console.log(id);
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

  challenge_available(status:string, id:string) {
    if (status === "Online" || status === "Playing")
      return (
        <ChallengeButton username={id}></ChallengeButton>
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
                  <div className='avatar' style={this.styleImgAsDiv(match.avatar_loc)}><span className={match.statusopp} title={match.statusopp}></span></div>
                
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