import React from 'react';
import axios from 'axios';
import internal from 'stream';
import './PlayerProfile.css';

type Person = {
    name: string;
    avatar_location: string;
    rank: number;
    victories: number;
    defeats:number;
    max_level:number;
}

const dflt:Person = {name: '', victories: 0, defeats: 0, avatar_location:'', rank:1, max_level:0};

type State = {
  player:Person
}

export default class PlayerProfile extends React.Component {
  state:State={player:dflt};

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
        const persons = res.data;
        let person = persons.at(0);
        let one: Person = dflt;  
        if (person.id !== undefined && person.name !== undefined) {
            one.rank = person.id;
            one.name = person.name;
        }
        this.setState({player: one});
        console.log(this.state);
      })
  }

  render() {
    return (
        <><h1>{this.state.player.name}</h1>
        <h3>Rank {this.state.player.rank}</h3>
        <ul id="stats-list">
            <li>
                <img className="image" src="https://cdn0.iconfinder.com/data/icons/education-340/100/Tilda_Icons_1ed_cup-512.png" alt="Trophy Icon" />
                <div className="content">
                    <p>{this.state.player.victories}</p>
                </div>
            </li>
            <br></br><br></br><br></br>
            <li>
                <img className="image" src="https://cdn0.iconfinder.com/data/icons/font-awesome-solid-vol-2/512/heart-broken-512.png" alt="Broken heart Icon" />
                <div className="content">
                    <p>{this.state.player.defeats}</p>
                </div>
            </li>
        </ul></>

    )
  }
}