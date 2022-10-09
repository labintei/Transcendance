import React from 'react';
import axios from 'axios';
import './PlayerProfile.css';
import {defaultavatar} from "./const";
import { useStore } from 'Game/src/State/state';

type Person = {
    name: string;
    avatar_location: string;
    rank: number;
    victories: number;
    defeats:number;
    max_level:number;
}
const dflt:Person = {name: '', victories: 0, defeats: 0, avatar_location:defaultavatar, rank:1, max_level:0};

type State = {
  player:Person
  nameEdit:boolean
  query:string
  query2:File | null
  avatarEdit:boolean
  bgChoice:number
}

export default class PlayerProfile extends React.Component {
  username:any = useStore((state:any) => state.profile.username);
  state:State={player:dflt, nameEdit:false, avatarEdit:false, query:'', query2:null, bgChoice:0};

  componentDidMount() {
    let player:Person = dflt;
    const username:string = useStore((state:any) => state.profile.username);
    const avatar_location:string = useStore((state:any) => state.profile.avatar_location);

    player.name = username;
    player.avatar_location = avatar_location;
    this.setState({player:player});
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
    useStore((store:any) => store.changeUsername(temp));
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

  styleImgAsDiv(src:string) {
    const divStyle = {
      backgroundImage: 'url(' + src + ')',
    };
    return (divStyle)
  }

  change_background(choice:number) {
    this.setState({bgChoice:choice});
  }

  create_button (num:number) {
    let img:string = "";
    let status:string = this.state.bgChoice === num ? "selected":"not-select";
    if (num === 0) {
      img = '/space_choice.jpg';
    } else if (num === 1) {
      img = '/blue_sky_choice.jpg';
    }

    return (
      <button className={status}
        style={this.styleImgAsDiv(img)}
        onClick={() => this.change_background(num)}>
      </button>
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
        </ul>
        <h3>Choose your in-game background :</h3>
        <div className='bgd-buttons'>
          {this.create_button(0)}
          {this.create_button(1)}
        </div>
        </>

    )
  }
}
// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon