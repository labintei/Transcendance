import React from 'react';
import axios from 'axios';
import './LevelList.css';

type PRank = {
    id: number
    name: string;
    rank: number;
    status: number;
    avatar_location: string;
}

const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";

type State = {
  listl:Array<PRank>
}

export default class LevelList extends React.Component {
  state:State= {listl:[]};

  componentDidMount() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "users/rank", {
      withCredentials: true
    }).then(res => {
        const pranks = res.data;
        console.log(pranks);
        let listtmp: Array<PRank> = [];   
        for (var prank of pranks) {
            let one: PRank = {id: 0, name: '', rank: 50, avatar_location:defaultavatar, status:0};
            if (prank.username !== undefined && prank.level !== undefined) {
                one.id = prank.level;
                one.name = prank.username;
                one.rank = prank.level;
                one.status = prank.id % 3;
                listtmp.push(one);
            }
        }
        console.log(listtmp);
        this.setState({listl: listtmp});
      })
  }

  challengeClicked(id:number) {
    console.log(id);
  }

  render_score(score:number) {
    if (score === 1)
      return ("Champion")
    if (score === 2)
      return ("2")
    else
      return (score)
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

  challenge_available(status:number, id:number) {
    if (status === 1)
      return (
        <button onClick={() => this.challengeClicked(id)}  id="challenge-button"></button>
      )
    else
        return (<img alt="challenge unavailable" src="/challenge_unavailable.png"></img>)
  }

  renderStatus (s:number) {
    if (s === 0) {
      return ("Offline")
    } else if (s === 1)
      return ("Online")
    else
      return ("Playing")
  }

  styleImgAsDiv(src:string) {
    const divStyle = {
      backgroundImage: 'url(' + src + ')',
    };
    return (divStyle)
  }

  render() {
    return (
        <ul id="level-list">
        {
          this.state.listl.map(prank =>
              <li key={prank.id} className={this.div_score(prank.rank)}>
                <div className='avatar' style={this.styleImgAsDiv(prank.avatar_location)}><span className={this.renderStatus(prank.status)}></span></div>
                <p>{prank.name}</p>
                <p>{this.render_score(prank.rank)}</p>
                {this.challenge_available(prank.status, prank.id)}
              </li>
            )
        }
      </ul>
    )
  }
}
