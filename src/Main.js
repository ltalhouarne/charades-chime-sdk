import React from 'react';
import { Switch, Route } from 'react-router-dom';

import GameRoom from './components/gameroom/GameRoom';
import Username from './components/username/Username';

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Username}></Route>
      <Route exact path='/signup' component={GameRoom}></Route>
    </Switch>
  );
}

export default Main