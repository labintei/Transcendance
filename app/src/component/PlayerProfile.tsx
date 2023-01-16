import React from 'react';
import axios from 'axios';
import './PlayerProfile.css';
import {defaultavatar} from "./const";
import { useStore } from 'Game/src/State/state';
import { Navigate } from 'react-router-dom';

type Person = {
    name: string;
    avatar_location: string;
    rank: number;
    victories: number;
    defeats:number;
    draws:number;
}
const dflt:Person = {name: 'default', victories: 0, defeats: 0, avatar_location:defaultavatar, rank:1, draws:0};

type State = {
  player:Person
  nameEdit:boolean
  errormsg:string | null
  query:string
  query2:File | null
  avatar:File | null
  avatarEdit:boolean
  logged:boolean
}

function get_status (num:number, bgd:number) {
  return (bgd === num ? "selected":"not-select")
}

function Customize(props: {pprof:PlayerProfile}) {
  const bgd:number = useStore((s:any) => s.bgdChoice);
  const padc:string = useStore((s:any) => s.padColor);
  const ballc:string = useStore((s:any) => s.ballColor);
  const changeBg:any = useStore((s:any) => s.changeBgd);
  const changePad:any = useStore((s:any) => s.changePadColor);
  const changeBall:any = useStore((s:any) => s.changeBallColor);

  return (
    <>
      <h3>Choose your in-game background :</h3>
        <div className='bgd-buttons'>
        <button className={get_status(0, bgd)}
          style={props.pprof.styleImgAsDiv('/space_choice.jpg')}
          onClick={() => changeBg(0)}>
        </button>
        <button className={get_status(1, bgd)}
          style={props.pprof.styleImgAsDiv('/sea_choice.jpg')}
          onClick={() => changeBg(1)}>
        </button>
        </div>
      <h3>Choose your colors :</h3>
      <input type="color" value={padc} id="pad" className="colorPick"
        onChange={event => {changePad(event.target.value)}
      }></input>
      <label htmlFor="pad">Paddle</label>
      <input type="color" value={ballc} id="ball" className="colorPick"
        onChange={event => {changeBall(event.target.value)}
      }></input>
      <label htmlFor="ball">Ball</label>
    </>
  )
}

export default class PlayerProfile extends React.Component {
  state:State;

  requestUser() {
    let player:Person = dflt;
    if (this.state !== undefined)
      player = { ...this.state.player};
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(res => {
      const data = res.data;
      console.log(res);
      if (data.username !== undefined && data.level !== undefined) {
        player.name = data.username;
        player.rank = data.level;
        if (data.victories !== undefined && data.defeats !== undefined && data.draws !== undefined) {
          player.defeats = data.defeats;
          player.victories = data.victories;
          player.draws = data.draws;
        }
        if (data.avatarURL !== undefined){
          axios.get(process.env.REACT_APP_BACKEND_URL + "avatar", {
            withCredentials: true,
            responseType:'blob'
          }).then(res => {
            player.avatar_location = URL.createObjectURL(res.data);
            this.setState({player:player});
          }).catch(error => {
            if (error.response.status === 401)
              this.setState({logged:false});
            else if (player !== this.state.player)
              this.setState({player:player});
          });
        } else if (player !== this.state.player)
          this.setState({player:player});
      }
    }).catch(error => {
      this.setState({logged:false});
    });
  }

  constructor (props:any) {
    super(props);
    this.state = {
      player:dflt, nameEdit:false, avatarEdit:false,
      query:'', query2:null, avatar:null, logged:true, errormsg:null
    };
    this.requestUser();
  }

  nameFormat(editing:boolean, name:string) {
    if (editing)
      return (
        <><input type="text"
          placeholder={name}
          minLength={2}
          maxLength={24}
          onChange={event => {this.setState({query: event.target.value})}}
          onKeyPress={event => {
                    if (event.key === 'Enter') {
                      this.changeName()
                    }
                  }}>
        </input>
        </>
      )
    else
        return (
          <><h1>{name}<button className='edit-button' onClick={() => this.setState({nameEdit:true})}></button></h1>

          </>
        )
  }

  changeName() {
    axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {username:this.state.query}, {withCredentials:true}).then(() => {
      let temp:Person = this.state.player;
      temp.name = this.state.query;
      this.setState({player:temp, nameEdit:false, errormsg:null});
    }).catch(error => {
      if (error.response.status === 500){
        this.setState({errormsg:this.state.query + " is already taken."})
      } else if (error.response.status === 412) {
        this.setState({errormsg:"Name is too long (24 characters max)."});
      } else if (error.response.status === 401)
        this.setState({logged:false});
      console.log(error)
    })
  }

  changeAvatar() {
    let temp:Person = this.state.player;
    if (this.state.query2 === null)
    {
      console.log(temp.avatar_location);
      this.setState({player:temp, avatarEdit:false});
      return ;
    }
    let formData = new FormData();
    formData.set('file', this.state.query2);
    axios.post(process.env.REACT_APP_BACKEND_URL + "avatar", formData, {
      withCredentials:true,
      responseType: 'blob'
    }).then(res => {
      console.log(res);
      temp.avatar_location = URL.createObjectURL(res.data); 
      this.setState({player:temp, avatarEdit:false});
    }).catch(error => {
      if (error.response === undefined)
        console.log(error);
      else if (error.response.status === 401)
        this.setState({logged:false});
      else
        console.log(error);
    });
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


  render() {
    return (
        <>
        {this.state.logged ? <></> : <Navigate to="/login"></Navigate>}
        <div className='place_name'>
          {this.nameFormat(this.state.nameEdit, this.state.player.name)}
        {this.state.errormsg === null ? <></> : <p className='warning-p'>{this.state.errormsg}</p>}
        </div>
        <div className='place_avatar'>
          {this.avatarFormat(this.state.avatarEdit, this.state.player.avatar_location)}
        </div>
        <h3>Rank {this.state.player.rank}</h3>
        <ul id="stats-list">
            <li>
                <img className="image" src="https://cdn2.iconfinder.com/data/icons/chess-58/412/Sword-512.png" alt="Total matches" />
                <p>{this.state.player.victories + this.state.player.defeats + this.state.player.draws}</p>
            </li>
            <li>
                <img className="image" src="https://cdn0.iconfinder.com/data/icons/education-340/100/Tilda_Icons_1ed_cup-512.png" alt="Trophy Icon" />
                <p>{this.state.player.victories}</p>
            </li>
            <li>
                <img className="image" src="https://cdn0.iconfinder.com/data/icons/font-awesome-solid-vol-2/512/heart-broken-512.png" alt="Broken heart Icon" />
                <p>{this.state.player.defeats}</p>
            </li>
        </ul>
        <Customize pprof={this}></Customize>
        </>

    )
  }
}
// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon
