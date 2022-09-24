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

const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";
const dflt:Person = {name: '', victories: 0, defeats: 0, avatar_location:defaultavatar, rank:1, max_level:0};

type State = {
  player:Person
  nameEdit:boolean
  avatarEdit:boolean
}

export default class PlayerProfile extends React.Component {
  state:State={player:dflt, nameEdit:false, avatarEdit:false};

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
        if (person.avatar_location !== undefined)
          one.avatar_location = person.avatar_location;
        this.setState({player: one});
        console.log(this.state);
      })
  }

  nameFormat(editing:boolean, name:string) {
    if (editing)
      return (
        <input type="text"></input>
      )
    else
        return (
          <><h1>{name}<button className='edit-button' onClick={() => this.setState({nameEdit:true})}></button></h1>
          
          </>
        )
  }


  avatarFormat(editing:boolean, loc:string) {
    if (editing)
      return (
        <input type="text"></input>
      )
    else
        return (
          <>
          <img className='avatar' src={this.state.player.avatar_location}>
            
          </img><button className='edit-button' onClick={() => this.setState({avatarEdit:true})}></button></>
        )
  }

  changeName(newname:string) {

  }

  render() {
    return (
        <>
        <div className='place_name'>
          {this.nameFormat(this.state.nameEdit, this.state.player.name)}
        </div>
        <div className='place_avatar'>
          {this.avatarFormat(this.state.avatarEdit, this.state.player.avatar_location)}
        </div>
        <h3>Rank {this.state.player.rank}</h3>
        <ul id="stats-list">
            <li>
                <img className="image" src="https://cdn0.iconfinder.com/data/icons/education-340/100/Tilda_Icons_1ed_cup-512.png" alt="Trophy Icon" />
                <p>{this.state.player.victories}</p>
            </li>
            <li>
                <img className="image" src="https://cdn0.iconfinder.com/data/icons/font-awesome-solid-vol-2/512/heart-broken-512.png" alt="Broken heart Icon" />
                <p>{this.state.player.defeats}</p>
            </li>
            <li>
                <img className="image" src="https://cdn1.iconfinder.com/data/icons/business-rounded-outline-fill-style/64/illustration_Personal_Development-256.png" alt="Solo Progress" />
                <p>{this.state.player.max_level}</p>
            </li>
        </ul></>

    )
  }
}
// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon