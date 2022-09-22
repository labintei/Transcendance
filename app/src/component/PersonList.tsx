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

export default class PersonList extends React.Component {
  state = {
    filterStr: "string"
  }
  listp: Person[] = []

  componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`)
      .then(res => {
        const persons = res.data;
        let listtmp: Person[] = [];    
        for (var person of persons) {
            let one: Person = {id: 0, name: '', status: 0, avatar_location:'', rank:1};
            console.log(person);
            if (person.id !== undefined && person.name !== undefined) {
                one.id = person.id;
                one.name = person.name;
                listtmp.push(one);
            }
        }
        this.listp = listtmp;
        console.log(this.listp);
      })
  }

  render() {
    return (
        <ul>
        {
          this.listp.map(person =>
              <li key={person.id}>{person.name}</li>
            )
        }
      </ul>
    )
  }
}
