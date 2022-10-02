import React from 'react';
import axios from 'axios';
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
  query:string
  query2:File | null
  avatarEdit:boolean
}

export default class PlayerProfile extends React.Component {
  state:State={player:dflt, nameEdit:false, avatarEdit:false, query:'', query2:null};

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
        <input type="text"
        placeholder={this.state.player.name}
          onChange={event => {this.setState({query: event.target.value})}}
          onKeyPress={event => {
                    if (event.key === 'Enter') {
                      this.changeName()
                    }
                  }}>
        </input>
      )
    else
        return (
          <><h1>{name}<button className='edit-button' onClick={() => this.setState({nameEdit:true})}></button></h1>
          
          </>
        )
  }

  changeName() {
    let temp:Person = this.state.player;
    temp.name = this.state.query;
    this.setState({player:temp, nameEdit:false});
  }

  changeAvatar() {
    let temp:Person = this.state.player;
    if (this.state.query2 != null)
    {
      temp.avatar_location = "/logo192.png";//this.state.query2.name;
    }
    console.log(temp.avatar_location);
    this.setState({player:temp, avatarEdit:false});
  }

  avatarFormat(editing:boolean, loc:string) {
    if (editing)
      return (<>
        <input type="file"
          id="avatar" name="avatar"
          accept="image/png, image/jpeg"
          onChange={event => {
            if (event.target.files != null)
              this.setState({query2: event.target.files[0]})
            }}>
        </input>
        <button className='send-button' onClick={() => this.changeAvatar()}>Send image</button>
        </>)
    else
        return (
          <>
          <img alt="avatar" className='avatar' src={this.state.player.avatar_location}>
          </img><button className='edit-button' onClick={() => this.setState({avatarEdit:true})}></button></>
        )
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