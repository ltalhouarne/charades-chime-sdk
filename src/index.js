import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import * as serviceWorker from './serviceWorker';
import GameRoom from './components/gameroom/GameRoom';
import JoinGameRoom from './components/gameroom/JoinGameRoom';

ReactDOM.render(
  <BrowserRouter basename="/Prod">
    <Switch>
      <Route exact path="/" component={App}/>
      <Route path="/gameroom" component={GameRoom}/>
      <Route path="/join" component={JoinGameRoom}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
