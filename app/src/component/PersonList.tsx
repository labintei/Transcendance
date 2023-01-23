import React from 'react';
import axios from 'axios';
import './PlayerList.css';
import {acceptedimg, defaultavatar} from "./const";
import { Navigate } from 'react-router-dom';

type Person = {
    id: number
    name: string;
    status: number;
    avatar_location: string;
    rank: number;
    friend: boolean;
    blocked: boolean;
}

type State = {
  listp:Array<Person>
  listf:Array<Person>
  logged:boolean
  query:string
}

export default class PersonList extends React.Component {
  state:State= {listp:[], listf:[], logged:true, query:""};

  constructor(props:any) {
    super(props);

    this.doSearch();
    this.friendsUpdate();
  }

  componentDidMount() {
  }

  challengeClicked(id:number) {
    console.log(id);
  }

  blockManage(id: number, friendlist: boolean): void {
    let person:Person = (friendlist ? this.state.listf[id] : this.state.listp[id]);
    if (person.blocked) {
      axios.delete(process.env.REACT_APP_BACKEND_URL + "blockeds/" + person.name, {
        withCredentials: true
      }).then(() => {
        this.doSearch();
      }).catch(error => {
        console.log(error);
        console.log(this.state);
      });
    } else {
      axios.put(process.env.REACT_APP_BACKEND_URL + "blockeds/" + person.name, {}, {
        withCredentials: true
      }).then(() => {
        this.doSearch();
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        console.log(error)
      });
    }
  }

  friendManage(id:number, friendlist:boolean) {
    let person:Person = (friendlist ? this.state.listf[id] : this.state.listp[id]);
    if (person.friend) {
      axios.delete(process.env.REACT_APP_BACKEND_URL + "friends/" + person.name, {
        withCredentials: true
      }).then(() => {
        this.friendsUpdate();
        this.doSearch();
      }).catch(error => {
        console.log(error);
        console.log(this.state);
      });
    } else {
      axios.put(process.env.REACT_APP_BACKEND_URL + "friends/" + person.name, {}, {
        withCredentials: true
      }).then(() => {
        this.friendsUpdate();
        this.doSearch();
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        console.log(error)
      });
    }
  }

  friendsUpdate() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "friends", {
      withCredentials: true
    }).then(async res => {
        const friends = res.data;
        let listftmp: Array<Person> = [];
        let id = 0;
        for (var person of friends) {
            let one: Person = {id: id, name: '', status: 0, avatar_location:defaultavatar, rank:1, friend:false, blocked:false};
            if (person.level !== undefined && person.username !== undefined) {
                one.rank = person.level;
                one.name = person.username;
                one.friend = true;
                if (person.avatarURL && person.avatarURL !== '')
                {
                  if (acceptedimg.includes(person.avatarURL))
                    await axios.get(process.env.REACT_APP_BACKEND_URL + "avatar/" + one.name, {
                        withCredentials: true,
                        responseType:'blob'
                      }).then(res => {
                        one.avatar_location = URL.createObjectURL(res.data);
                      }).catch(error => {
                        if (error.response.status === 401)
                          this.setState({logged:false});
                      });
                    else
                      one.avatar_location = person.avatarURL;
                }
                listftmp.push(one);
            }
            id++;
        }
        this.setState({listf: listftmp, logged:true});
      }).catch(error => {
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
        console.log(error)
      });
  }


  doSearch() {
    axios.get(process.env.REACT_APP_BACKEND_URL + "search/" + this.state.query, {
      withCredentials: true
    }).then(async res => {
        const others = res.data;
        let listtmp: Array<Person> = [];
        let id = 0;
        for (var person of others) {
            let one: Person = {id: id, name: '', status: 0, avatar_location:defaultavatar, rank:1, friend:false, blocked:false};
            if (person.level !== undefined && person.username !== undefined) {
                one.rank = person.level;
                one.name = person.username;
                if (person.relatedships !== undefined && person.relatedships[0] !== undefined)
                {
                  let ships:Array<{status:string}> = person.relatedships;
                  one.friend = ships[0].status === "Friend";
                  one.blocked = ships[0].status === "Blocked";
                }
                else
                  one.friend = false;
                  if (person.avatarURL !== undefined && '' !== person.avatarURL)
                  {
                    if (acceptedimg.includes(person.avatarURL))
                      await axios.get(process.env.REACT_APP_BACKEND_URL + "avatar/" + one.name, {
                          withCredentials: true,
                          responseType:'blob'
                        }).then(res => {
                          one.avatar_location = URL.createObjectURL(res.data);
                        }).catch(error => {
                          if (error.response.status === 401 || error.response.status === 403)
                            this.setState({logged:false});
                        });
                    else
                        one.avatar_location = person.avatarURL;
                  }
                  listtmp.push(one);
            }
            id++;
        }
        this.setState({listp: listtmp, logged:true});
        console.log(this.state);
      }).catch(error => {
        console.log(error);
        if (error.response.status === 401 || error.response.status === 403)
          this.setState({logged:false});
      });
  }

  render_status(status:number) {
    if (status === 0)
      return ("Offline")
    else if (status === 1)
      return ("Online")
    else
      return ("In Match")
  }

  render_list(list:Array<Person>, flist:boolean) {
    return (
      <ul id="person-list">
        {
          list.map(person =>
            <li key={person.id}>
              <img alt="avatar" className="avatar" src={person.avatar_location}></img>
              <p>{person.name}</p>
              <>{person.blocked ?
                <p>Blocked</p>
              :
                <p>{this.render_status(person.status)}</p>
              }</>
              <button onClick={() => this.challengeClicked(person.id)}  id="challenge-button"></button>
              { person.blocked ?
              <><button onClick={() => this.friendManage(person.id, flist)} id={person.friend ? "remove-f-button" : "add-f-button"}></button>
                <button onClick={() => this.blockManage(person.id, flist)} id="unblock-button"></button>
                </>
              : person.friend ?
                <button onClick={() => this.friendManage(person.id, flist)} id="remove-f-button"></button>
              :
                <><button onClick={() => this.friendManage(person.id, flist)} id="add-f-button"></button>
                <button onClick={() => this.blockManage(person.id, flist)} id="block-button"></button>
                </>
              }
            </li>
          )
        }
      </ul>
    )
  }

  render_friend(list:Array<Person>) {
    if (list.length === 0)
      return (<p>You've got no friends on the server for now !</p>)
    else
      return (
        this.render_list(list, true)
      )
  }

  render_others(list:Array<Person>) {
    if (list.length === 0)
      return (<p>Your search corresponds to no one on the server.</p>)
    else
      return (
        this.render_list(list, false)
      )
  }

  render() {
    console.log(this.state);
    return (
        <>
        {this.state.logged ? <></> : <Navigate to="/login"></Navigate>}
        <h3>Friends :</h3>
        {
          this.render_friend(this.state.listf)
        }
        <h3>Others :</h3>
        <input type="text"
          placeholder="Search users"
          minLength={3}
          onChange={event => {this.setState({query: event.target.value})}}
          onKeyDown={event => {
                    if (event.key === 'Enter') {
                      this.doSearch()
                    }
                  }}>
        </input>
        {
          this.render_others(this.state.listp)
        }
      </>
    )
  }
}
