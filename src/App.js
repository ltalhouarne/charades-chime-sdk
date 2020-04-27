import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import {
  BrowserRouter as Router
} from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.joinRoom = this.joinRoom.bind(this);
    this.state = { username: "", error: "" };
  }

  joinRoom(e, newRoom) {
    e.preventDefault()

    if (this.state.username.length <= 0) {
      this.setState({error: "Please provide a display name to continue"})
    } else {
      this.props.history.push({
        pathname: newRoom ? '/gameroom' : '/join',
        state: { username: this.state.username, baseUrl: "https://4t4digur8a.execute-api.us-west-2.amazonaws.com/Prod" }
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
                <br/>
                <Button onClick={(e) => this.joinRoom(e, true)} className="submit-button" variant="light">Create a game room</Button>
                <br/>
                <Button onClick={(e) => this.joinRoom(e, false)} className="submit-button" variant="light">Join an existing game room</Button>

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