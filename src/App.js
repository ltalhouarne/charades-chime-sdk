import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Form.Group>
          <Form.Row className="justify-content-md-center">
            <Form.Label column="lg" lg={12} className="header">
              What would you like to be called?
            </Form.Label>
            <Col column="lg" lg={6}>
              <Form.Control className="submit-button" size="lg" type="text" placeholder="Username" />
            </Col>
          </Form.Row>
          <Router>
          <Link to="/gameroom">
            <Button className="submit-button" variant="light">Join the game room</Button>
          </Link>
          </Router>
        </Form.Group>
      </header>
    </div>
  );
}

export default App;