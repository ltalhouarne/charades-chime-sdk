import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import {
  BrowserRouter as Router,
  Link,
  Route
} from "react-router-dom";
import GameRoom from './components/gameroom/GameRoom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.joinRoom = this.joinRoom.bind(this);
    this.state = { username: "", error: "" };
  }

  joinRoom (e) {
    e.preventDefault()

    if (this.state.username.length <= 0) {
      this.setState({error: "Please provide a display name to continue"})
    } else {
      this.props.history.push({
        pathname: '/gameroom',
        state: { username: this.state.username }
      })
    }
	}

  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <Router>
              <Form.Group>
                <Form.Row className="justify-content-md-center">
                  <Form.Label column="lg" lg={12} className="header">
                    What would you like to be called?
                  </Form.Label>
                  <Col column="lg" lg={6}>
                    <Form.Control className="submit-button" 
                    onKeyPress={event => {
                      if (event.key === 'Enter') {
                        this.joinRoom(event)
                      }
                    }}
                    onChange={event => {
                      this.setState({username: event.target.value})
                    }} 
                    onsize="lg" type="text" placeholder="Display Name" />
                  </Col>
                </Form.Row>
                <Button onClick={this.joinRoom} className="submit-button" variant="light">Join the game room</Button>
              </Form.Group>
              {this.state.error && 
              <Row className="justify-content-md-center">
                <Col column="lg" lg={12}>
                  <Alert className="error" variant="danger">
                    {this.state.error}
                  </Alert>
                </Col>
              </Row>}
            </Router>
          </header>
        </div>
      </Router>
    );
  }
}

export default App;