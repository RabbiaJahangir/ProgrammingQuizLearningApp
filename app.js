/**
 * Created by Jahangir on 10/8/2015.
 */
/*jslint node:true*/
"use strict";

var express = require('express'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    credentials = require('./credentials'),
    mongoose = require('mongoose'),
    user = require('./models')(mongoose).user,
    Logger = require('morgan');

var PORT = 3000;

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

app.use(passport.initialize());
app.use(passport.session());
//Authentication middleware function for checking on each get and post request if the user is already logged in or not
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else
        res.send('/notLoggedIn');
}


app.get('/profile', function (req, res) {
    res.send('User Profile page');
});
app.get('/signup', isAuthenticated, function (req, res) {
    res.send('User profile page');
});
app.get('/login', isAuthenticated, function (req, res) {
    res.send('User profile page');
});
//app.post('/login', passport.authenticate('login-strategy', {
//    successRedirect: '/profile',
//    failureRedirect: '/failedLogin',
//}));
//app.post('/signup', passport.authenticate('signup-strategy', {
//    successRedirect: '/profile',
//    failureRedirect: '/signup',
//}));

app.post('/login', function (req, res, next) {
    passport.authenticate('login-strategy', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({loggedIn: "false"});
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.json({loggedIn: "true"});
        });
    })(req, res, next);
});
app.post('/signup', function (req, res, next) {
    passport.authenticate('signup-strategy', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({signedUp: "false"});
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.json({signedUp: "true"});
        });
    })(req, res, next);
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

/*----Authentication code starts here----*/

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    user.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('signup-strategy', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    user.findOne({'email': email}, function (err, member) {
        if (err) {
            return done(err);
        }
        if (member) {
            return done(null, false);
        } else {
            var newPlayer = new user();
            newPlayer.email = email;
            newPlayer.password = newPlayer.createPasswordHash(password);
            newPlayer.save(function (err) {
                if (err) {
                    throw err;
                }
                return done(null, newPlayer);
            });
        }
    });
}));

passport.use('login-strategy', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    console.log("inside authentication");
    user.findOne({'email': email}, function (err, member) {
        if (err) {
            return done(err);
        }
        if (!member) {
            return done(null, false);
        }
        if (!member.comparePassword(password)) {
            return done(null, false);
        }
        return done(null, member);
    });
}));


// starts the server
app.listen(PORT, function () {
    console.log('Server up and running on port: ' + PORT);
});

/*----Authentication code ends here----*/



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