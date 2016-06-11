/**
 * Created by Jahangir on 10/8/2015.
 */
/*jslint node:true*/
"use strict";

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    credentials = require('./credentials'),
    mongoose = require('mongoose'),
    user = require('./models')(mongoose).user,
    Logger = require('morgan');


require('./authentication/authenticate')(passport, LocalStrategy);
require('./authentication/authenticate-routes')(app, passport);

var PORT = 8080;

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
app.use(Logger('dev'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser());
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
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
    res.send("hello");
});

// starts the server
app.listen(PORT, function () {
    console.log('Server up and running on port: ' + PORT);
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