import React from 'react';
import axios from 'axios';
import './PlayerList.css';

type Person = {
    id: number
    name: string;
    status: number;
    avatar_location: string;
    rank: number;
    friend: boolean;
}

const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";

type State = {
  pwait:number
  waiting:boolean
  listp:Array<Person>
  listf:Array<Person>
}

export default class PersonList extends React.Component {
  state:State= {pwait:0, listp:[], waiting:false, listf:[]};

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
        const persons = res.data;
        let listftmp: Array<Person> = [];
        let listtmp: Array<Person> = [];
        for (var person of persons) {
            let one: Person = {id: 0, name: '', status: 0, avatar_location:defaultavatar, rank:1, friend:false};
            console.log(person);
            if (person.id !== undefined && person.name !== undefined) {
                one.id = person.id;
                one.name = person.name;
                if (person.id < 4)
                  one.friend = true;
                if (one.friend)
                  listftmp.push(one);
                else
                  listtmp.push(one);
            }
        }
        this.setState({listp: listtmp, listf: listftmp, pwait: Math.trunc(Math.random() * 4)});
        console.log(this.state);
      })
  }

  challengeClicked(id:number) {
    console.log(id);
  }

  friendManage(id:number) {
    console.log(id);
  }

  render_status(status:number) {
    if (status === 0)
      return ("Offline")
    else if (status === 1)
      return ("Online")
    else
      return ("In Match")
  }

  get_friend_status(isf:boolean) {
    if (!isf)
      return ("add-f-button")
    else
      return ("remove-f-button")
  }

  render_list(list:Array<Person>) {
    return (
      <ul id="person-list">
        {
          list.map(person =>
            <li key={person.id}>
              <img alt="avatar" className="avatar" src={person.avatar_location}></img>
              <p>{person.name}</p>
              <p>{this.render_status(person.status)}</p>
              <button onClick={() => this.challengeClicked(person.id)}  id="challenge-button"></button>
              <img alt="friend" className="friend" src="https://cdn4.iconfinder.com/data/icons/basic-ui-2-line/32/people-group-team-peoples-friend-512.png"/>
              <button onClick={() => this.friendManage(person.id)} id={this.get_friend_status(person.friend)}></button>
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
        this.render_list(list)
      )
  }

  render_others(list:Array<Person>) {
    if (list.length === 0)
      return (<p>There is no one else on the server for now !</p>)
    else
      return (
        this.render_list(list)
      )
  }

  change_waiting() {
    if (this.state.waiting)
    {
      this.setState({waiting:false})
      console.log("Start matching")
    }
    else
    {
      this.setState({waiting:true})
      console.log("Stop Matching")
    }

  }

  render() {
    return (
        <>
        <h2>People waiting for a opponent : {this.state.pwait}</h2>
        <h2>{(this.state.waiting ? "Matching you with people..." : "Challenge them !")}</h2>
        <button className="matching-button" onClick={() => this.change_waiting()}>{(this.state.waiting ? "Stop" : "Start") + " Matching"}</button>
        <h3>Friends :</h3>
        {
          this.render_friend(this.state.listf)
        }
        <h3>Others :</h3>
        {
          this.render_others(this.state.listp)
        }
      </>
    )
  }
}
