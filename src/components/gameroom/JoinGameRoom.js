import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import {
  BrowserRouter as Router
} from "react-router-dom";

const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

class JoinGameRoom extends React.Component {
    constructor(props) {
        super(props);
        this.joinRoom = this.joinRoom.bind(this);
        this.state = { error: "", roomCode: "" };
    }

    joinRoom (e) {
        e.preventDefault()

        const baseUrl = this.props.location.state.baseUrl

        if (this.state.roomCode.length <= 0 || this.state.roomCode.length !== 4) {
            this.setState({ error: "Please provide a valid gameroom code" })
        } else {
          fetch(`${baseUrl}/gameroom/join?DisplayName=${this.props.location.state.username}&GameRoomCode=${this.state.roomCode}`, requestOptions)
            .then(response => response.json())
            .then(data => {
              this.props.history.push({
                pathname: '/gameroom',
                state: { username: this.props.location.state.username, 
                    roomCode: this.state.roomCode, meeting: data.Meeting, 
                    playerAttendee: data.PlayerAttendee }
              })
            })
            .catch(error => {
              this.setState({ error: JSON.stringify(error) });
            });
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
                      Welcome, {this.props.location.state.username}! Enter your 4 letter gameroom code:
                    </Form.Label>
                    <Col column="lg" lg={4}>
                      <Form.Control className="submit-button" 
                      onKeyPress={event => {
                        if (event.key === 'Enter') {
                          this.joinRoom(event)
                        }
                      }}
                      onChange={event => {
                        this.setState({roomCode: event.target.value})
                      }} 
                      onsize="lg" type="text" placeholder="Room code" />
                    </Col>
                  </Form.Row>
                  <br/>
                  <Button onClick={this.joinRoom} className="submit-button" variant="light">Join gameroom</Button>

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

export default JoinGameRoom;