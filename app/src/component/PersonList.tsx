import React from 'react';
import axios from 'axios';
import internal from 'stream';
import './PlayerList.css';

type Person = {
    id: number
    name: string;
    status: number;
    avatar_location: string;
    rank: number;
}

const defaultavatar = "https://cdn1.iconfinder.com/data/icons/ui-essential-17/32/UI_Essential_Outline_1_essential-app-ui-avatar-profile-user-account-512.png";

type State = {
  listp:Array<Person>
}

export default class PersonList extends React.Component {
  state:State= {listp:Array()};

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
        const persons = res.data;
        let listtmp: Array<Person> = Array<Person>(0);   
        for (var person of persons) {
            let one: Person = {id: 0, name: '', status: 0, avatar_location:defaultavatar, rank:1};
            console.log(person);
            if (person.id !== undefined && person.name !== undefined) {
                one.id = person.id;
                one.name = person.name;
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

  render_status(status:number) {
    if (status == 0)
      return ("Offline")
    else if (status == 1)
      return ("Online")
    else
      return ("In Match")
  }

  get_friend_status(id:number) {
    if (id > 4)
      return ("add-f-button")
    else
      return ("remove-f-button")
  }

  render() {
    return (
        <ul id="person-list">
        {
          this.state.listp.map(person =>
              <li key={person.id}>
                <img className="avatar" src={person.avatar_location}></img>
                <p>{person.name}</p>
                <p>{this.render_status(person.status)}</p>
                <button onClick={() => this.challengeClicked(person.id)}  id="challenge-button"></button>
                <img className="friend" src="https://cdn4.iconfinder.com/data/icons/basic-ui-2-line/32/people-group-team-peoples-friend-512.png"/>
                <button onClick={() => this.friendManage(person.id)} id={this.get_friend_status(person.id)}></button>
              </li>
            )
        }
      </ul>
    )
  }
}
