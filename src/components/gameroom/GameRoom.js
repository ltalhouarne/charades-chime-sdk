import React from 'react';
import './GameRoom.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
} from "react-router-dom";

class GameRoom extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <header className="App-header">
          <div className="welcome-message">
            Welcome, {this.props.location.state.username}!
          </div>
        </header>
      </Router>
    );
  }
}

export default GameRoom;