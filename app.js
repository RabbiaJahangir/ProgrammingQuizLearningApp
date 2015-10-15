/**
 * Created by Jahangir on 10/8/2015.
 */

var app = require('express')();
var server= require('http').Server(app)
var io = require('socket.io')(server);

server.listen(80);


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
var players = [];

io.on('connection', function (player) {
    console.log("Welcome");
    players.push(player);
    console.log(players.length);
    console.log("player connected");
    player.on('disconnect', function () {
        players.splice(players.indexOf(player), 1);
        console.log("player disconnected");
        console.log(players.length);
    });

});

