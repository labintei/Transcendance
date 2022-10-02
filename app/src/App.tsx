import React, { useState } from 'react';
import './App.css';
import PersonList from './component/PersonList';
import LevelList from './component/LevelList';
import MatchList from './component/MatchHistory';
import PlayerProfile from './component/PlayerProfile';
import PongGame from './Game/src/PongGame'

const components = {
  matching: PersonList,
  playerprofile: PlayerProfile,
  historymatch: MatchList,
  levels: LevelList,
  default: PersonList,
  game: PongGame,
}

class App extends React.Component {
  state: { compo: keyof typeof components, menuDisplay: boolean };

  constructor(props: any) {
    super(props);
    this.state =
    {
      compo: "default",
      menuDisplay: true
    };


    // This binding is necessary to make `this` work in the callback
    this.matchhistory = this.matchhistory.bind(this);
    this.getlevels = this.getlevels.bind(this);
    this.matching = this.matching.bind(this);
    this.getprofile = this.getprofile.bind(this);
    this.getgame = this.getgame.bind(this);
  }

  matching() {
    this.setState({ compo: "matching" });
  }

  getprofile() {
    this.setState({ compo: "playerprofile" });
  }

  matchhistory() {
    this.setState({ compo: "historymatch" });
  }

  getlevels() {
    this.setState({ compo: "levels" });
  }
  getgame() {
    this.setState({ compo: "game", menuDisplay: false });
  }

  render() {

    const ComponentType = components[this.state.compo];

    const display = this.state.menuDisplay;
    return (
      <div className="App">
        {
          display && (
            <menu>
              <li><button onClick={this.matching}>Matching</button></li>
              <li><button onClick={this.getlevels}>LeaderBoard</button></li>
              <li><button onClick={this.matchhistory}>History</button></li>
              <li><button onClick={this.getprofile}>Profile</button></li>
              <li><button onClick={this.getgame}>game</button></li>
            </menu>
          )
        }
        <div className="content">
          <ComponentType />
        </div>
      </div>
    );
  }
}

export default App;
