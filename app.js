/**
 * Created by Jahangir on 10/8/2015.
 */
/*jslint node:true*/
"use strict";

var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    player = require('./player');

server.listen(80);


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
var players = [];

function createPlayer(socket) {
    players.push(socket);
    console.log(players.length);
}
function destroyPlayer(socket) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == socket.id) {
            players.splice(i, 1);
        }
    }
    console.log(players.length);
}

io.on('connection', function (player) {
    createPlayer(player);
    console.log(player.id);

    player.on('req', function (data) {
        console.log(player.id + " " + data.msg);
    });


});

