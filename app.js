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
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    credentials = require('./credentials'),
    mongoose = require('mongoose'),
    Logger = require('morgan');

app.use(Logger('dev'));

var PORT = 8000;

//mongoose connectivity
mongoose.connect(credentials.mongo.dbConnectionString);
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('There occured an error connecting to the mongodb');
});
db.on('open', function () {
    console.log("Connection to mongodb is established");
});

app.use(express.static(__dirname + '/public'));

//bodyParser for extracting post form data
//cookieParser for parsing cookies and adding cookie variable in req obj for express session
//passport for authentication
//express session for creating sessions on server side, stores in MemoryStore

app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
app.use(expressSession({
    cookie: {maxAge: credentials.cookie.cookieAge},
    saveUninitialized: true,
    resave: true,
    secret: credentials.cookie.secretForCookie
}));
//Request cookies logger
// app.use(function (req, res, next) {
//     console.log(req.cookies);
//     console.log(req.headers);
//     next();
// });
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    next();
});
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
    res.send("hello");
});
// starts the server
server.listen(PORT, function () {
    console.log('Server up and running on port: ' + PORT);
});

require('./authentication/authenticate')(passport, LocalStrategy, mongoose);
require('./routes/authenticate-routes')(app, passport);
require('./routes/avatar-routes');


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