import React from 'react';
import axios from 'axios';
import './MatchList.css';
import {defaultavatar} from "./const";
import { Navigate } from 'react-router-dom';

type Match = {
    id: number;
    idopp: number;
    statusopp: number;
    name: string;
    score1: number;
    score2: number;
}

type State = {
  logged: boolean,
  listp:Array<Match>,
  avatar_loc:string
}

export default class MatchList extends React.Component {
  state:State;

  requestUser() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      const data = res.data;
      if (data.avatar_loc !== undefined) {
        this.setState({avatar_loc:data.avatar_loc});
      }
    }).catch(error => {
      this.setState({logged:false});
    });
  }

  constructor (props:any) {
    super(props);
    this.state= {listp:[], logged:true, avatar_loc:defaultavatar};
    this.requestUser();
  }
  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`, {
      withCredentials: true
    }).then(res => {
        const matchs = res.data;
        let listtmp: Array<Match> = [];   
        for (var match of matchs) {
            let one: Match = {
              id: 0, idopp: 0, statusopp: Math.trunc(Math.random() * 3), name: '', score1:Math.trunc(Math.random() * 5), score2:Math.trunc(Math.random() * 5)
            };
            if (match.id !== undefined && match.name !== undefined) {
                one.id = match.id;
                one.name = match.name;
                
                listtmp.push(one);
            }
        }
        this.setState({listp: listtmp});
        console.log(this.state);
      })
  }

  challengeClicked(id:number) {
    console.log(id);
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

  challenge_available(status:number, id:number) {
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
                  <img src={defaultavatar} alt="avatar"></img>
                  <p>You</p>
                  <p className='score1'>{match.score1}</p>
                </div>
                {this.challenge_available(match.statusopp, match.idopp)}
                <div className={this.render_status(match.score2, match.score1)}>
                  <p className='score2'>{match.score2}</p>
                  <p>{match.name}</p>
                  <div className='avatar' style={this.styleImgAsDiv(defaultavatar)}><span className={this.renderStatus(match.statusopp)}></span></div>
                
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