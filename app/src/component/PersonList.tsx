import React from 'react';
import axios from 'axios';
import internal from 'stream';

type Person = {
    id: number
    name: string;
    status: number;
    avatar_location: string;
    rank: number;
}

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
            let one: Person = {id: 0, name: '', status: 0, avatar_location:'', rank:1};
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

  render() {
    return (
        <ul>
        {
          this.state.listp.map(person =>
              <li key={person.id}>{person.name}</li>
            )
        }
      </ul>
    )
  }
}
