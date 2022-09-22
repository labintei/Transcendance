import React from 'react';
import logo from './logo.svg';
import './App.css';
import PersonList from './component/PersonList';
import { profile } from 'console';
import { isPropertyAccessOrQualifiedName } from 'typescript';
//https://nextjs.org/docs/basic-features/layouts#with-typescript  App(PersonList)

const components = {
  matching : PersonList,
  playerprofile : PersonList,
  default : PersonList
}

function matching() {
  App({type:"matching"});
}

function getprofile() {
  App({type:"playerprofile"});
}

function App(props:{type:keyof typeof components}={type:"default"}) {

  const ComponentType = components[props.type];
  return (
    <div className="App">
      <menu>
        <li><button onClick={matching}>Matching</button></li>
        <li><button onClick={getprofile}>Profile</button></li>
      </menu>
      <div className="content">
        <ComponentType />
      </div>
    </div>
  );
}

export default App;
