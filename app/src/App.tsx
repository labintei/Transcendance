import React from 'react';
import logo from './logo.svg';
import './App.css';
import PersonList from './component/PersonList';
//https://nextjs.org/docs/basic-features/layouts#with-typescript
function App(Component: React.Component) {
  return (
    <div className="App">
      <menu>
        <li><button onclick={App({PersonList})}>Match</button></li>
        <li><button onclick={App(PersonList)}>Friends</button></li>
        <li><button onclick={App(PersonList)}>Profile</button></li>
      </menu>
      <div className="content">
        <Component/>
      </div>
    </div>
  );
}

export default App;
