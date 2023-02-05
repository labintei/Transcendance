import React from 'react';
import axios from 'axios';
import './PlayerProfile.css';
import { defaultavatar } from "./const";
import { Navigate } from 'react-router-dom';
import { useStore } from 'Game/src/State/state'

type Person = {
    name: string;
    avatar_location: string;
    rank: number;
    victories: number;
    defeats:number;
    draws:number;
    xp:number;
    totalxp:number;
}
const dflt:Person = {
  name: 'default', victories: 0, defeats: 0, avatar_location: defaultavatar, rank: 1, draws: 0,
  xp: 0,
  totalxp: 0
};

type State = {
  player:Person
  nameEdit:boolean
  errormsg:string | null
  query:string
  query2:File | null
  avatar:File | null
  avatarEdit:boolean
  logged:boolean
  bgd:number
  padc:string
  ballc:string
  boardc:string
}

function UpdateChoice(props:{
  bgd:number,
  padc:string,
  ballc:string,
  boardc:string}) {

  const map:any = useStore((s: any) => s.changeBgd);
  const changePad:any = useStore((s:any) => s.changePadColor);
  const changeBall:any = useStore((s:any) => s.changeBallColor);
  const changeBoard:any = useStore((s:any) => s.changeBoardColor);

  map(props.bgd);
  changeBall(props.ballc);
  changeBoard(props.boardc);
  changePad(props.padc);
  return (
    <></>
  )
}

export default class PlayerProfile extends React.Component {
  state:State;
  editor:any;

  requestUser() {
    let player:Person = dflt;
    if (this.state !== undefined)
      player = { ...this.state.player};
    axios.get(process.env.REACT_APP_BACKEND_URL + "user", {
      withCredentials: true
    }).then(async res => {
      const data = res.data;
      // console.log(res);
      if (data.username !== undefined && data.level !== undefined) {
        player.name = data.username;
        player.rank = data.level;
        if (data.victories !== undefined && data.defeats !== undefined && data.draws !== undefined) {
          player.defeats = data.defeats;
          player.victories = data.victories;
          player.draws = data.draws;
          if (data.xp !== undefined && data.xpAmountForNextLevel !== undefined) {
            player.xp = data.xp;
            player.totalxp = data.xpAmountForNextLevel;
          } 
        }
        if (data.avatarURL && data.avatarURL !== '')
            player.avatar_location = data.avatarURL;
        if (player !== this.state.player) {
          if (data.padColor !== undefined && data.ballColor !== undefined && data.boardColor !== undefined && data.bgdChoice !== undefined)
            this.setState({player:player, bgd:data.bgdChoice, padc:data.padColor, ballc:data.ballColor, boardc:data.boardColor})
          else
            this.setState({player:player});
        }
      }
    }).catch(error => {
      this.setState({logged:false});
    });
  }

  constructor (props:any) {
    super(props);
    this.state = {
      player:dflt, nameEdit:false, avatarEdit:false,
      query:'', query2:null, avatar:null, logged:true, errormsg:null, bgd:0, padc:"", ballc:"", boardc:""
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
          onKeyDown={event => {
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
    axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {username:encodeURIComponent(this.state.query)}, {withCredentials:true}).then(() => {
      let temp:Person = this.state.player;
      temp.name = this.state.query;
      this.setState({player:temp, nameEdit:false, errormsg:null});
    }).catch(error => {
      if (error.response.status === 409){
        this.setState({errormsg:this.state.query + " is already taken."})
      } else if (error.response.status === 412) {
        this.setState({errormsg:"Name is too long (24 characters max)."});
      } else if (error.response.status === 401 || error.response.status === 403)
        this.setState({logged:false});
      console.log(error)
    })
  }

  changeAvatar() {
    let temp:Person = this.state.player;
    if (this.state.query2 === null)
    {
      // console.log(temp.avatar_location);
      this.setState({player:temp, avatarEdit:false});
      return ;
    }
    let formData = new FormData();
    formData.set('file', this.state.query2);
    axios.post(process.env.REACT_APP_BACKEND_URL + "avatar", formData, {
      withCredentials:true,
      responseType: 'blob'
    }).then(() => {
      window.location.reload();
    }).catch(error => {
      // if (error.response === undefined)
      //   console.log(error);
      if (error.response.status === 401 || error.response.status === 403)
        this.setState({logged:false});
      else if (error.response.status === 413)
        this.setState({errormsg:"File Too Big"});
      // else
      //   console.log(error);
    });
  }

  avatarFormat(editing:boolean) {
    if (editing)
      return (<>
        <input type="file"
          id="avatar" name="avatar"
          accept="image/png, image/jpeg, image/jpg"
          onChange={event => {
            if (event.target.files != null)
              this.setState({query2: event.target.files[0]})
            }}>
        </input>
        <button className='send-button' onClick={() => this.changeAvatar()}>Send image</button><br/><br/><br/><br/>
        <button onClick={() => this.setState({avatarEdit:false, errormsg:null})}>Cancel</button>
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

  setBoardC(value: string) {
    if (value !== this.state.boardc)
      axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {boardColor:value}, {withCredentials:true}).then(() => {
        this.setState({boardc:value});
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        // console.log(error)
      })
  }

  setBallC(value: string) {
    if (value !== this.state.ballc)
      axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {ballColor:value}, {withCredentials:true}).then(() => {
        this.setState({ballc:value});
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        // console.log(error)
      })
  }

  setPadC(value: string) {
    if (value !== this.state.padc)
      axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {padColor:value}, {withCredentials:true}).then(() => {
        this.setState({padc:value});
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        // console.log(error)
      })
  }

  setBgd(arg0: number) {
    if (arg0 !== this.state.bgd)
      axios.patch(process.env.REACT_APP_BACKEND_URL + "user", {bgdChoice:arg0}, {withCredentials:true}).then(() => {
        this.setState({bgd:arg0});
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        // console.log(error)
      })
  }

  render() {
    const noxp:boolean = (this.state.player.xp > this.state.player.totalxp || this.state.player.totalxp === 0);
    let current_xp_style:any;
    if (noxp)
      current_xp_style = {width: "0%"}
    else
      current_xp_style = {
        width: (100 * this.state.player.xp / this.state.player.totalxp) + "%"
      }
    return (
        <>
        {this.state.logged ? <></> : <Navigate to="/login"></Navigate>}
        <div className='place_name'>
          {this.nameFormat(this.state.nameEdit, this.state.player.name)}
        {this.state.errormsg === null ? <></> : <p className='warning-p'>{this.state.errormsg}</p>}
        </div>
        <div className='place_avatar'>
          {this.avatarFormat(this.state.avatarEdit)}
        </div>
        <h3>Level {this.state.player.rank}</h3>
        {noxp ?  <></> :
        <div className='total_xp'>
          <div className='current_xp' style={current_xp_style}></div>
          {this.state.player.xp} / {this.state.player.totalxp} xp
        </div>
        }
        <ul id="stats-list">
            <li>
                <img className="image" src="https://cdn2.iconfinder.com/data/icons/chess-58/412/Sword-512.png" alt="Total matches" title='Total matches' />
                <p>{this.state.player.victories + this.state.player.defeats + this.state.player.draws}</p>
            </li>
            <li>
                <img className="image"  title='Number of wins' src="https://cdn0.iconfinder.com/data/icons/education-340/100/Tilda_Icons_1ed_cup-512.png" alt="Trophy Icon"/>
                <p>{this.state.player.victories}</p>
            </li>
            <li>
                <img className="image"  title='Number of defeats' src="https://cdn0.iconfinder.com/data/icons/font-awesome-solid-vol-2/512/heart-broken-512.png" alt="Broken heart Icon" />
                <p>{this.state.player.defeats}</p>
            </li>
        </ul>
        <h3>Choose your in-game background :</h3>
          <div className='bgd-buttons'>
          <button className={0 === this.state.bgd ? "selected":"not_selected"}
            style={this.styleImgAsDiv('/space_choice.jpg')}
            onClick={() => {this.setBgd(0)}}>
          </button>
          <button className={1 === this.state.bgd ? "selected":"not_selected"}
            style={this.styleImgAsDiv('/sea_choice.jpg')}
            onClick={() => {this.setBgd(1)}}>
          </button>
          </div>
        <h3>Choose your colors :</h3>
        <input type="color" value={this.state.padc} id="pad" className="colorPick"
          onChange={event => {this.setPadC(event.target.value)}
        }></input>
        <label htmlFor="pad">Paddle</label>
        <input type="color" value={this.state.ballc} id="ball" className="colorPick"
          onChange={event => {this.setBallC(event.target.value)}
        }></input>
        <label htmlFor="ball">Ball</label>
        <input type="color" value={this.state.boardc} id="board" className="colorPick"
          onChange={event => {this.setBoardC(event.target.value)}
        }></input>
        <label htmlFor="board">Board</label>
        <UpdateChoice bgd={this.state.bgd} ballc={this.state.ballc}
        boardc={this.state.boardc} padc={this.state.padc}
        ></UpdateChoice>
        </>
    )
  }
}
// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon
