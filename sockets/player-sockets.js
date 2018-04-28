var util = require('util')

module.exports = function (io, socketioJwt, credentials, questions) {

  var Questions = questions;

  var ALL_PLAYERS_ROOM = 'allPlayers'; // all players, not looking for a match will be in this room
  var MATCHING_ROOM = 'matchRoom'; //  all the users looking for a match will be put into this room

  // to authorize the socket connections
  io.set('authorization', socketioJwt.authorize({
    secret: credentials.secret,
    handshake: true
  }));

  /* we will use the default namespace of '/'
   *  But as soon as the player is authenticated and connected, we will add him to allPlayers room
   */

  io.on('connect', function (player) {
    console.log('connected');
    sendTotalPlayersUpdate();

    // player has been connected, now let him join allPlayers room
    player.join(ALL_PLAYERS_ROOM, function () {
      sendPlayersUpdate();

      player.on('matchPlayer', function (data) {
        player.leave(ALL_PLAYERS_ROOM, function () {
          player.join(MATCHING_ROOM, function () {
            console.log('joined ', MATCHING_ROOM);
            sendPlayersUpdate();

            player.join(data.categoryId, function () {
              var categoryRoom = data.categoryId;
              var connectedSockets = Object.keys(io.sockets.adapter.rooms[categoryRoom].sockets);

              // If two players have joined the room of same category, match them
              if (connectedSockets.length >= 2) {
                var matchingSocketsIds = connectedSockets.slice(0, 2);
                var privateRoomForMatchedPlayers = matchingSocketsIds[0] + matchingSocketsIds[1];

                var matchingSocketsUsersProfile = [];
                var matchingSocketsUsers = [];
                matchingSocketsIds.forEach(function (socket) {
                  matchingSocketsUsersProfile.push(io.sockets.connected[socket].request.decoded_token._doc);
                  matchingSocketsUsers.push(io.sockets.connected[socket]);
                });

                var results = [];
                matchingSocketsIds.forEach(function (socket) {
                  var playerSocket = io.sockets.connected[socket];
                  playerSocket.leave(categoryRoom);
                  playerSocket.join(privateRoomForMatchedPlayers, function () {
                    playerSocket.emit('matched', matchingSocketsUsersProfile);
                    player.leave(MATCHING_ROOM);
                  });

                  playerSocket.on('startMatch', function () {
                    var categoryId = data.categoryId;
                    Questions.find({category: categoryId}).limit(5).exec(function (err, questions) {
                      if (!err) {
                        playerSocket.emit('questions', questions);
                      } else {
                        console.log(err);
                      }
                    });
                  });

                  playerSocket.on('answered', function (correctPlayer) {
                    matchingSocketsUsers.forEach(function (playerInMatch, index) {
                      if (matchingSocketsUsersProfile[index].email !== correctPlayer.user.email) {
                        playerInMatch.emit('failed', correctPlayer.index);
                      }
                    })
                  });

                  playerSocket.on('submitResults', function (res) {
                    var result = res;
                    result.socket = playerSocket;
                    results.push(result);

                    if (results.length >= 2) {
                      if (results[0].correct > results[1].correct) {
                        results[0].socket.emit('results', {result: 'won'});
                        results[1].socket.emit('results', {result: 'lost'});
                      } else if (results[0].correct < results[1].correct) {
                        results[0].socket.emit('results', {result: 'lost'});
                        results[1].socket.emit('results', {result: 'won'});
                      } else if (results[0].correct === results[1].correct) {
                        results[0].socket.emit('results', {result: 'draw'});
                        results[1].socket.emit('results', {result: 'draw'});
                      }
                      //empty array
                      results = [];
                    }
                  });

                  playerSocket.on('leaveMatch', function () {
                    playerSocket.leave(privateRoomForMatchedPlayers);
                    playerSocket.removeAllListeners('leaveMatch');
                    playerSocket.removeAllListeners('startMatch');
                    playerSocket.removeAllListeners('correctAnswer');
                    playerSocket.removeAllListeners('submitResults');
                    playerSocket.join(ALL_PLAYERS_ROOM);
                    io.to(privateRoomForMatchedPlayers).emit('playerLeft');

                    matchingSocketsIds.forEach(function (playerSocketId) {
                      var socketToLeave = io.sockets.connected[playerSocketId];
                      playerSocket.leave(privateRoomForMatchedPlayers);
                      playerSocket.join(ALL_PLAYERS_ROOM);
                      playerSocket.removeAllListeners('leaveMatch');
                      playerSocket.removeAllListeners('startMatch');
                      playerSocket.removeAllListeners('correctAnswer');
                      playerSocket.removeAllListeners('submitResults');
                    });
                  });
                });
              }
            });
          });
        });
      });
    });

    player.on('leaveMatch', function (data) {
      player.leave(MATCHING_ROOM, function () {
        player.leave(data.categoryId, function () {
          player.join(ALL_PLAYERS_ROOM);
        });
        sendPlayersUpdate();
      });
    });

    player.on('disconnect', function (player) {
      console.log('disconnected');
      sendPlayersUpdate();
    });
  });

  function getFreePlayers() {
    var allPlayersRoom = io.sockets.adapter.rooms[ALL_PLAYERS_ROOM];
    if (allPlayersRoom) {
      return allPlayersRoom;
    }
    return null;
  }

  function getTotalPlayers() {
    return Object.keys(io.sockets.connected);
  }

  function getMatchingPlayers() {
    var matchingPlayersRoom = io.sockets.adapter.rooms[MATCHING_ROOM];
    if (MATCHING_ROOM) {
      return matchingPlayersRoom;
    }
    return null;
  }

  function sendFreePlayersUpdate() {
    var freePlayers = getFreePlayers();
    var ids = freePlayers ? freePlayers.sockets : {};
    var count = freePlayers ? Object.keys(freePlayers.sockets).length : 0;
    io.emit('freePlayers', {playerIds: ids, count: count});
  }

  function sendTotalPlayersUpdate() {
    var totalPlayers = getTotalPlayers();
    io.emit('totalPlayers', {playerIds: totalPlayers, count: totalPlayers.length})
  }

  function sendMatchingPlayers() {
    var matchingPlayers = getMatchingPlayers();
    var ids = matchingPlayers ? matchingPlayers.sockets : {};
    var count = matchingPlayers ? Object.keys(matchingPlayers.sockets).length : 0;
    io.emit('matchingPlayers', {playerIds: ids, count: count});
  }

  function sendPlayersUpdate() {
    sendTotalPlayersUpdate();
    sendFreePlayersUpdate();
    sendMatchingPlayers();
  }
}
