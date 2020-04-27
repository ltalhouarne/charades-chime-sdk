import React from 'react';
import './GameRoom.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
} from "react-router-dom";
const sdk = require('amazon-chime-sdk-js');
const logger = new sdk.ConsoleLogger('SDK', sdk.LogLevel.INFO);
const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};
const maxPlayerCount = 16

class GameRoom extends React.Component {

  constructor(props) {
    super(props);

    var videos = []
    var indexMap = {};

    for (var i = 0; i < maxPlayerCount; i++) {
      videos.push(<video width="200" height="100" id={i} key={i}></video>)
    }

    this.state = { session: null, observer: null, 
      roomCode: this.props.location.state.roomCode, 
      meeting: this.props.location.state.meeting, 
      playerAttendee: this.props.location.state.playerAttendee,
      videos: videos, indexMap: indexMap
    };
  }

  acquireVideoElement(tileId) {
    var indexMap = this.state.indexMap;

    // Return the same video element if already bound.
    for (let i = 0; i < maxPlayerCount; i += 1) {
      if (indexMap.hasOwnProperty(i) && indexMap[i].tileId === tileId) {
        return i;
      }
    }

    // Return the next available video element.
    for (let i = 0; i < maxPlayerCount; i += 1) {
      if (!indexMap.hasOwnProperty(i)) {
        indexMap[i] = { tileId: tileId, attendeeId: "", username: "" }
        this.setState({ indexMap: indexMap })
        return i;
      }
    }
    
    throw new Error('No video element is available');
  }

  componentDidMount() {
    //If we don't have a room code, we need to create a game room
    if (!this.state.roomCode) {
      console.log("Creating meeting...")
      fetch(`${this.props.location.state.baseUrl}/gameroom/new?DisplayName=${this.props.location.state.username}`, requestOptions)
        .then(response => response.json())
        .then(data => {
          //data.Gameroom.Players.L [{"S":"{ PlayerId: bbdcca65-6009-49ca-8947-5a4fae0aacc0, Username: loic }"}]
          this.setState({ roomCode: data.GameCode, meeting: data.Meeting, 
            playerAttendee: data.PlayerAttendee, gameRoom: data.Gameroom }, () => this.createSession());
        })
        .catch(error => {
          this.setState({ error: error });
        });
    } else {
      this.createSession()
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      console.log("Refreshing game details...")

      fetch(`${this.props.location.state.baseUrl}/gameroom/details?GameRoomCode=${this.state.GameCode}`)
        .then(response => response.json())
        .then(data => {
          //data.Gameroom.Players.L [{"S":"{ PlayerId: bbdcca65-6009-49ca-8947-5a4fae0aacc0, Username: loic }"}]
          console.log("Gameroom:" + JSON.stringify(data.Gameroom))
          this.setState({ gameRoom: data.Gameroom })
        })
        .catch(error => {
          this.setState({ error: error });
        });
    }, 10000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  createSession() {
    console.log("Creating session...");
    const session = new sdk.DefaultMeetingSession(
      new sdk.MeetingSessionConfiguration(
        this.state.meeting.Meeting, 
        this.state.playerAttendee.Attendee
      ),
      logger,
      new sdk.DefaultDeviceController(logger),
    );

    const observer = {
      audioVideoDidStart: () => {
        session.audioVideo.startLocalVideoTile();
      },
      videoTileDidUpdate: tileState => {
        // Ignore a tile without attendee ID and a content share.
        if (!tileState.boundAttendeeId || tileState.isContent) {
          return;
        }

        if (tileState.localTile) {
          session.audioVideo.bindVideoElement(tileState.tileId, document.getElementById("localVideo"));
        } else {
          session.audioVideo.bindVideoElement(tileState.tileId, document.getElementById(this.acquireVideoElement(tileState.tileId)));
        }
      }
    };

    this.setState({session: session, observer: observer})

    session.audioVideo.addObserver(observer);

    (async () => {
      const firstAudioDeviceId = (await session.audioVideo.listAudioInputDevices())[0].deviceId;
      await session.audioVideo.chooseAudioInputDevice(firstAudioDeviceId);
      const firstVideoDeviceId = (await session.audioVideo.listVideoInputDevices())[0].deviceId;
      await session.audioVideo.chooseVideoInputDevice(firstVideoDeviceId);
      session.audioVideo.bindAudioElement(document.getElementById("audio"));
      session.audioVideo.start();
    })();
  }

  render() {
    return (
      <Router>
        <header className="App-header">
          <div className="welcome-message">
            Welcome, {this.props.location.state.username}! {this.state.roomCode}
            <audio id="audio">
            </audio>
            <video id="localVideo" width="300" height="150"></video>
            <span id="localUsername">{this.props.location.state.username}</span>
            { this.state.videos } 
          </div>
        </header>
      </Router>
    );
  }
}

export default GameRoom;