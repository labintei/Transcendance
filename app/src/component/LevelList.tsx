import React from 'react';
import axios from 'axios';
import internal from 'stream';
import './LevelList.css';

type Level = {
    id: number
    name: string;
    rank: number;
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
        let sco:number = 1;
        let listtmp: Array<Level> = Array<Level>(0);   
        for (var level of levels) {
            let one: Level = {id: 0, name: '', rank: sco, avatar_location:defaultavatar};
            console.log(level);
            if (level.id !== undefined && level.name !== undefined) {
                one.id = level.id;
                one.name = level.name;
                listtmp.push(one);
            }
            if (sco > 0)
              sco += 1;
        }
        this.setState({listl: listtmp});
      })
  }

  challengeClicked(id:number) {
    console.log(id);
  }

  render_score(score:number) {
    if (score == 1)
      return ("Champion")
    if (score == 2)
      return ("2")
    else
      return (score)
  }

  div_score(rank:number) {
    if (rank == 1)
      return ("gold-rank")
    else if (rank == 3)
      return ("bronze-rank")
    else if (rank == 2)
      return ("silver-rank")
    else
      return ("low-rank")
  }

  challenge_available(status:number, id:number) {
    if (status == 1)
      return (
        <button onClick={() => this.challengeClicked(id)}  id="challenge-button"></button>
      )
    else
        return (<img src="https://cdn2.iconfinder.com/data/icons/chess-58/412/Sword-512.png"></img>)
  }

  render() {
    return (
        <ul id="level-list">
        {
          this.state.listl.map(level =>
              <li key={level.id} className={this.div_score(level.rank)}>
                <img className='avatar' src={level.avatar_location}></img>
                <p>{level.name}</p>
                <p>{this.render_score(level.rank)}</p>
                {this.challenge_available(level.rank, level.id)}
              </li>
            )
        }
      </ul>
    )
  }
}
