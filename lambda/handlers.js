const AWS = require('aws-sdk');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const mime = require('mime-types');
const path = require('path');
const ddb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient(); 
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

exports.website = async (event, context, callback) => {
  return getContent(event.path, callback);
};

exports.getGameRoom = async (event, context, callback) => {
  if (!event.queryStringParameters || !event.queryStringParameters.Game) {
    return reply(callback, 400, { Error: 'Must provide GameRoomCode query parameter' });
  }

  let gameRoom;
  try {
    var result = await ddb.getItem({
      Key: { GameRoomCode: { S: event.queryStringParameters.GameRoomCode, }, },
      TableName: process.env.GAMES_TABLE_NAME,
    }).promise();
    gameRoom = result.Item;
    if (!gameRoom) {
      throw new Error('Gameroom not found');
    }
  } catch (err) {
    return reply(callback, 404, {Error: `Gameroom does not exist: ${event.queryStringParameters.GameRoomCode}`});
  }

  return reply(callback, 200, {
    GameRoom: gameRoom
  });
}

exports.joinGameRoom = async (event, context, callback) => {
  if (!event.queryStringParameters || !event.queryStringParameters.DisplayName) {
    return reply(callback, 400, { Error: 'Must provide DisplayName query parameter' });
  }

  if (!event.queryStringParameters || !event.queryStringParameters.GameRoomCode) {
    return reply(callback, 400, { Error: 'Must provide GameRoomCode query parameter' });
  }

  let gameRoom;
  try {
    var result = await ddb.getItem({
      Key: { GameRoomCode: { S: event.queryStringParameters.GameRoomCode, }, },
      TableName: process.env.GAMES_TABLE_NAME,
    }).promise();
    gameRoom = result.Item;
    if (!gameRoom) {
      throw new Error('Gameroom not found');
    }
  } catch (err) {
    return reply(callback, 404, {Error: `Gameroom does not exist: ${event.queryStringParameters.GameRoomCode}`});
  }

  let meeting;
  try {
    meeting = await chime.getMeeting({
      MeetingId: gameRoom.MeetingId.S
    }).promise();
  } catch (err) {
    return reply(callback, 404, {Error: `Meeting no longer exists for Gameroom: ${event.queryStringParameters.GameRoomCode}`});
  }

  const meetingId = meeting.Meeting.MeetingId;

  const playerAttendee = await chime.createAttendee({
    MeetingId: meetingId,
    ExternalUserId: uuidv4(),
  }).promise();

  await ddb.putItem({
    Item: {
      'PlayerId': { S: playerAttendee.Attendee.AttendeeId },
      'GameRoomCode': { S: event.queryStringParameters.GameRoomCode },
      'DisplayName': { S: event.queryStringParameters.DisplayName },
      'CreatedOnDate': {S: (new Date()).toISOString() },
      'TTL': { N: `${Math.floor(Date.now() / 1000) + 86400}` },
    },
    TableName: process.env.PLAYERS_TABLE_NAME,
  }).promise();

  await docClient.update({
      TableName: process.env.GAMES_TABLE_NAME,
      Key: {
        "GameRoomCode": event.queryStringParameters.GameRoomCode
      },
      UpdateExpression: "SET #p = list_append(#p, :vals)",
      ExpressionAttributeNames: {
        "#p": "Players"
      },
      ExpressionAttributeValues: {
        ":vals": [ `{ PlayerId: ${playerAttendee.Attendee.AttendeeId}, Username: ${event.queryStringParameters.DisplayName} }` ]   
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

  return reply(callback, 200, {
    Meeting: meeting,
    PlayerAttendee: playerAttendee,
    GameRoom: gameRoom
  });
};

exports.createGameroom = async (event, context, callback) => {
  if (!event.queryStringParameters || !event.queryStringParameters.DisplayName) {
    return reply(callback, 400, { Error: 'Must provide DisplayName query parameter' });
  }

  const meeting = await chime.createMeeting({
    ClientRequestToken: uuidv4(),
    MediaRegion: 'us-west-2',
  }).promise();

  const meetingId = meeting.Meeting.MeetingId;

  const playerAttendee = await chime.createAttendee({
    MeetingId: meetingId,
    ExternalUserId: uuidv4(),
  }).promise();

  const fourLetterMeeting = Math.random().toString(36).substr(2, 4)
  const creationDate = (new Date()).toISOString()

  var gameRoom = {
    'GameRoomCode': { S: fourLetterMeeting },
    'MeetingId': { S: meetingId },
    'CreatedOnDate': {S: creationDate },
    'Players': { L: [ { "S" : `{ PlayerId: ${playerAttendee.Attendee.AttendeeId}, Username: ${event.queryStringParameters.DisplayName} }` } ] },
    'TTL': { N: `${Math.floor(Date.now() / 1000) + 86400}` },
  }

  await ddb.putItem({
    Item: gameRoom,
    TableName: process.env.GAMES_TABLE_NAME,
  }).promise();

  await ddb.putItem({
    Item: {
      'PlayerId': { S: playerAttendee.Attendee.AttendeeId },
      'GameRoomCode': { S: fourLetterMeeting },
      'DisplayName': { S: event.queryStringParameters.DisplayName },
      'CreatedOnDate': {S: creationDate },
      'TTL': { N: `${Math.floor(Date.now() / 1000) + 86400}` },
    },
    TableName: process.env.PLAYERS_TABLE_NAME,
  }).promise();

  return reply(callback, 200, {
    GameCode: fourLetterMeeting,
    Meeting: meeting,
    PlayerAttendee: playerAttendee,
    Gameroom: gameRoom
  });
};

function getContent(urlPath, callback) {
  callback(null, {
    statusCode: 200,
    headers: { 'Content-Type': mime.lookup( urlPath === '/' ? '/index.html' : urlPath) },
    body: fs.readFileSync(path.join(process.env.LAMBDA_TASK_ROOT, './', urlPath === '/' ? '/index.html' : urlPath), { encoding: 'utf8' }),
    isBase64Encoded: false
  });
}

function reply(callback, statusCode, result) {
  callback(null, {
    statusCode: statusCode,
    //TODO: remove cors
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(result, '', 2) + '\n',
    isBase64Encoded: false
  });
}