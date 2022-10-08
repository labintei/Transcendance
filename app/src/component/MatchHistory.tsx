import React from 'react';
import axios from 'axios';
import './MatchList.css';


type Match = {
    id: number;
    idopp: number;
    statusopp: number;
    name: string;
    score1: number;
    score2: number;
}

type State = {
  listp:Array<Match>
}

const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";

export default class MatchList extends React.Component {
  state:State= {listp:[]};

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
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
        return (<img alt="challenge unvailable" src="/challenge_unavailable.png"></img>)
  }
  
  render() {
    return (
        <ul id="match-list">
        {
        this.state.listp.map(match =>
            <li key={match.id}>
                <div className={this.render_status(match.score1, match.score2)}>
                  <img src={defaultavatar} alt="avatar"></img>
                  <p>You</p>
                  <p className='score1'>{match.score1}</p>
                </div>
                <button onClick={() => this.challengeClicked(match.id)}  id="challenge-button"></button>
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

}