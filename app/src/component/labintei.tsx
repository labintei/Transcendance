import React from 'react';
import { useState , useEffect } from 'react';
import axios from 'axios';
import './labintei.css';
import userEvent from '@testing-library/user-event';
import { Console } from 'console';


function State_funct() {
  const [name, setName] = useState("Etat1");
  const changeName = () => {
    setName("Etat1");
  };

  return (
    <div>
      <p>
        My name is {name}
      </p>
      <button onClick={changeName}>Click</button>
    </div>
  );
}
//export default State_funct;

function State_funct_2() {
  const [count, setCount] = useState(0);// initialize a zero
  useEffect(() => {console.log('you clicked on the Button ${count} times')});
}
//export default State_funct_2;

// Use Effect permet de run un Effect une fois

function Once() {
  const [count, setCount] = useState(0);
  useEffect(() => {console.log('You have clicked ${count} times')}, []);
  return(<div><button onClick={() => setCount(count + 1)}>Click</button></div>)
}
// export default Once;

function deux_boutons() {
  const [count1, setCount] = useState(0);

  useEffect(() => {console.log('You clicked ${count} sur le bouton 1')}, [count1]);

  const [count2, setCount2] = useState(0);

  useEffect(() => {console.log('You clicked on button 2 ${count}')}, [count2]);

  return (
    <div>
      <button onClick={() => setCount(count1 + 1)}>Click 1</button>
      <button onClick={() => setCount(count2 + 2)}>Click 2</button>
    </div>
  );
}
// export default beux_bountons;


function own_hook(url){
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
    .then((res) => res.json())
    .then((data) => setData(data))
    .catch((err) => console.log('Error ; $(err)'));
  }, [url]);
  return {data};
}
export default own_hook

// ES6 feature in react
/*
  MODULE/DESTRUCTURING/SPREADOPERATOR/ARROWFUNCTONS/TEMPLATELITERALS

    index.tsx
    scripts.ts 
    MyModules
    add.ts
    sub.ts
  
  // arrow fonctoins 

  g est functions 
  var g = () => {...}
  
  var t = (a,b) => {return a+b;}
mieux vaut utiliser ''



    */


/*
    Organisation de mon site

    Create user

    _saisir : name , username (Contrainte) 

    Select un user

    -> affichera apres le profile

    Create un message direct

    -> prompt user1 qui send a -> prompt user2 -> msg

    Create un block entre deux personnes

    -> prompt user1 (qui bloque user2) prompt user2

    Create a channel

    -> owner id, status
    
    Create un message channel

    -> sender id, -> msg , -> list des gens qui recoit

    Create un block channel

    -> 

    Create un admin

*/

// profit
type Person = {
    name: string;
    ft_login: string;
    rank: number;
    victories: number;
    defeats:number;
    max_level:number;
}

const dflt:Person = {name: '', ft_login: '', victories: 0, defeats: 0,  rank:1, max_level:0};

type State = {
    player:Person
    nameEdit:boolean
    query:string
    query2:File | null
    avatarEdit:boolean
    bgChoice:number
  }

const profil = {
  first: 'test',
  last: 'test',
  avatarurl: "faux"
};

function createUser() {

}


// has a any type ???
function fonct_p(profil) {
  return profil.first + " " + profil.last;
}

const element = (<h1>Hello, {" " + profil.first + " " + profil.last}</h1>);

const test = <h1>Salut tout le monde</h1>;

// ON peut specifier des attributs avec JSX
// link
const e = <a href="https://www.reactjs.org"> link </a>;
// image
const i = <img src={profil.avatarurl}></img>;
// on peut avoir des children

const paragraphe = (
  <div>
    <h1>Hello</h1>
    <h2>Texte</h2>
  </div>
);

// prevenir des injection Attacks
// ""
const t = response.potentiallyMaliciousInput;
const g = <h1>{t}</h1>;

// same

const v1 = (
  <h1 className='greeting'>
    Hello
  </h1>
);

const v3 = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello'
);

const v2 = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello'
  }
};

// Rendering Elements
// React DOM package procure des methodes specifiaue qui peuvent etre utilise pour echapper au model react
// provides des modules specifiaue pour client et server app  
// fonctionne a partir de node

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

function tick() {
  const p = (
  <div>
    <h1>Hello</h1>
    <h2>It is {new Date().toLocaleTimeString()}</h2>
  </div>
  );
  root.render(element);
}

// Component and Props
// props c est ce qui sera dans la balise
// component c est l elements


function a(props)
{
  return <h1>Hello, {props.name}</h1>;
}

// export de component pouvoir mettre un State se ...

function function_a(){console.log("a")};

// en html
//<button onclick="fonction_a()">fonction_a</button>
// react

<button onClick={function_a}>Ok</button>

// html
/*
<form onsubmit="console.log('You click'); return false">
  <button type="submit">Submit</button>
</form>*/

function Form() {
  function handleSubmit(e) {
    e.preventDefault();
    console.log('Submit');
  }
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  )

}


//     state:State={player:dflt, nameEdit:false, avatarEdit:false, query:'', query2:null, bgChoice:0};
// export default


// props correspoond a properties


class Labintei extends React.Component {

  constructor(props) {
    super(props)
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }  

  handleSubmit(event) {
    alert('A name was submitted ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <>
      <h1>
        Titre 1
      </h1>
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange}/>
        </label>
        <input type="submit" value="Submit" />
      </form>
      <div>
        Bonjour tout le monde
      </div>
      </>
    )
  }
}
// Intersting icon
//https://www.iconfinder.com/icons/103676/path_icon