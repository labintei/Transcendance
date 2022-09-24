import React from 'react';
import logo from './logo.svg';
import './App.css';
import PersonList from './component/PersonList';
import MatchList from './component/MatchHistory';
import PlayerProfile from './component/PlayerProfile';
import { profile } from 'console';
import { isPropertyAccessOrQualifiedName } from 'typescript';
//https://nextjs.org/docs/basic-features/layouts#with-typescript  App(PersonList)

const components = {
  matching : PersonList,
  playerprofile : PlayerProfile,
  historymatch: MatchList,
  levels: MatchList,
  default : PersonList
}

class App extends React.Component {
  state:{compo:keyof typeof components};

  constructor(props: any) {
    super(props);
    this.state = {compo:"default"};

    // This binding is necessary to make `this` work in the callback
    this.matching = this.matching.bind(this);
    this.getprofile = this.getprofile.bind(this);
  }

  matching() {
    this.setState({compo:"matching"});
  }
  
  getprofile() {
    this.setState({compo:"playerprofile"});    
  }
  matchhistory() {
    this.setState({compo:"historymatch"});
  }
  
  getlevels() {
    this.setState({compo:"levels"});    
  }

  render() {

  const ComponentType = components[this.state.compo];
  return (
    <div className="App">
      <menu>
        <li><button onClick={this.matching}>Matching</button></li>
        <li><button onClick={this.getlevels}>Levels</button></li>
        <li><button onClick={this.matchhistory}>History</button></li>
        <li><button onClick={this.getprofile}>Profile</button></li>
      </menu>
      <div className="content">
        <ComponentType />
      </div>
    </div>
  );
  }
}

export default App;
