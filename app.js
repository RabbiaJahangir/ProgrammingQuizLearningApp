/**
 * Created by Jahangir on 10/8/2015.
 */
/*jslint node:true*/
"use strict";

var express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  bodyParser = require('body-parser'),
  credentials = require('./credentials'),
  mongoose = require('mongoose'),
  Logger = require('morgan'),
  jwt = require('jsonwebtoken');

// ------====== configuration ========-------

var PORT = process.env.PORT || 8000;
app.set('appSecret', credentials.secret);

// -------======= MongoDB Stuff (using Mongoose) ========------
//mongoose connectivity

mongoose.connect(credentials.dbConnectionString);
var db = mongoose.connection;

db.on('error', function (err) {
  console.info('There occured an error connecting to the mongodb');
});

db.on('open', function () {
  console.info("Connection to mongodb is established");
});

// Try to re connect on disconnected
db.on('disconnected', function () {
  console.info("Re connecting to mongodb");
  mongoose.connect(credentials.dbConnectionString);
});

// ------=========== Middlewares ==========-----------

app.use(Logger('dev'));

// Middleware to be executed on every incoming request, for checking if the connection to DB is already established
app.use(function (req, res, next) {
  // mongoose.connection.readyState returns status codes
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting, 4 = invalid credentials
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    console.info("Re connecting to mongodb");
    mongoose.connect(credentials.dbConnectionString);
  }
  next();
});

app.use(express.static(__dirname + '/public'));

//bodyParser for extracting post form data
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, x-access-token, Accept');
  if (req.method === "OPTIONS")
    res.sendStatus(200);
  else
    next();
});


// -------======== Routes =========----------

app.get("/", function (req, res) {
  res.send("hello");
});

var user = require('./models/user')(mongoose);
// -------====== Local Files Require To Include in the app ======-------
require('./routes/avatar-routes')(app);
require('./routes/authenticate-routes')(app, express, jwt, user);
// any routes after above authenticate-routes will be protected by default BECUASE OF USE MIDDLEWARE IN ABOVE REQUIRED FILE
// need valid credential/token to access anything below
require('./routes/categories-route')(app, mongoose);
require('./routes/profile-routes')(app, user, jwt);


// starts the server
server.listen(PORT, function () {
  console.log('Server up and running on port: ' + PORT);
});

var players = [];
io.on('connection', function (socket) {

  players.push(socket);
  console.log("Got some connection");
  io.emit('noOfPlayers', {no: players.length});

  socket.on('disconnect', function () {
    console.log("player disconnected");
    players.splice(players.indexOf(socket), 1);
    io.emit('noOfPlayers', {no: players.length});
  });

});

/* server = require('http').Server(app),
 io = require('socket.io')(server),
 match = require('./match')();

 server.listen(80);


 app.get('/', function (req, res) {
 res.sendFile(__dirname + "/index.html");
 });


 io.on('connection', function (player) {
 player.emit('connected', {connectedMsg: "Player socket CONNECTED to the server!"});
 match.storePlayer(player);

 player.on('match', function (data) {
 match.addToWaiting(player);
 });
 player.on('disconnect', function () {
 player.emit('disconnected', {disconnectedMsg: "Player socket DISCONNECTED from the server!"});
 match.destroyPlayer(player);
 });


 });*/
