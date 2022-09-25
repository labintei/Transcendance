import React from 'react';
import axios from 'axios';
import './MatchList.css';


type Match = {
    id: number;
    name: string;
    score1: number;
    score2: number;
}

type State = {
  listp:Array<Match>
}

export default class MatchList extends React.Component {
  state:State= {listp:Array()};

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
        const matchs = res.data;
        let listtmp: Array<Match> = Array<Match>(0);   
        for (var match of matchs) {
            let one: Match = {
              id: 0, name: '', score1:Math.trunc(Math.random() * 5), score2:Math.trunc(Math.random() * 5)
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

  render() {
    return (
        <ul id="match-list">
        {
        this.state.listp.map(match =>
            <li key={match.id}>
                <div className={this.render_status(match.score1, match.score2)}>
                  <p>You</p>
                  <p>{match.score1}</p>
                </div>
                <img src="https://cdn4.iconfinder.com/data/icons/halloween-2476/64/swords-weapons-antique-fight-war-512.png"></img>
                <div className={this.render_status(match.score2, match.score1)}>
                  <p>{match.score2}</p>
                  <p>{match.name}</p>
                </div>
            </li>
            )
        }
        </ul>
    )
  }

}