import React from 'react';
import axios from 'axios';
import internal from 'stream';
import './LevelList.css';

type Level = {
    id: number
    name: string;
    score: number;
    avatar_location: string;
}

const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";

type State = {
  listl:Array<Level>
}

export default class LevelList extends React.Component {
  state:State= {listl:Array()};

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
        const levels = res.data;
        let sco:number = 3;
        let listtmp: Array<Level> = Array<Level>(0);   
        for (var level of levels) {
            let one: Level = {id: 0, name: '', score: sco, avatar_location:defaultavatar};
            console.log(level);
            if (level.id !== undefined && level.name !== undefined) {
                one.id = level.id;
                one.name = level.name;
                listtmp.push(one);
            }
            if (sco == 0)
              sco = -1;
            if (sco > 0)
              sco -= 1;
        }
        this.setState({listl: listtmp});
      })
  }

  challengeClicked(id:number) {
    console.log(id);
  }

  render_score(score:number) {
    if (score <= 0)
      return ("No Score")
    else
      return (score + "/3")
  }

  div_score(score:number) {
    if (score > 0)
      return ("high-score")
/*    else if (score == 2)
      return ("median-score")
    else if (score == 1)
      return ("low-score")*/
    else if (score == 0)
      return ("to-score")
    else
      return ("no-score")
  }

  challenge_available(score:number, id:number) {
    if (score >= 0)
      return (
        <button onClick={() => this.challengeClicked(id)}  id="challenge-button"></button>
      )
    else
        return (<></>)
  }

  render() {
    return (
        <ul id="level-list">
        {
          this.state.listl.map(level =>
              <li key={level.id} className={this.div_score(level.score)}>
                <p>Level {level.id}</p>
                <p>{this.render_score(level.score)}</p>
                {this.challenge_available(level.score, level.id)}
              </li>
            )
        }
      </ul>
    )
  }
}
