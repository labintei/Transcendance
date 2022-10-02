import React from 'react';
import './App.css';
import PersonList from './component/PersonList';
import LevelList from './component/LevelList';
import MatchList from './component/MatchHistory';
import PlayerProfile from './component/PlayerProfile';

const components = {
  matching : PersonList,
  playerprofile : PlayerProfile,
  historymatch: MatchList,
  levels: LevelList,
  default : PersonList
}

class App extends React.Component {
  state:{compo:keyof typeof components};

  constructor(props: any) {
    super(props);
    this.state = {compo:"default"};

    // This binding is necessary to make `this` work in the callback
    this.matchhistory = this.matchhistory.bind(this);
    this.getlevels = this.getlevels.bind(this);
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
        <li><button onClick={this.getlevels}>LeaderBoard</button></li>
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
