var util = require('util')

module.exports = function (io, socketioJwt, credentials) {

  var defaultNamespace = '/';

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
    // console.log('hello! ', player.request.decoded_token);

    // player has been connected, now let him join allPlayers room
    player.join(ALL_PLAYERS_ROOM, function () {
      sendPlayersUpdate();

      player.on('matchPlayer', function () {
        player.leave(ALL_PLAYERS_ROOM, function () {
          player.join(MATCHING_ROOM, function () {
            console.log('joined ', MATCHING_ROOM);
            sendPlayersUpdate();

            // findMatchingPlayer(player);

          });
        });
      });
    });

    player.on('leaveMatch', function () {
      player.leave(MATCHING_ROOM, function () {
        player.join(ALL_PLAYERS_ROOM);
        sendPlayersUpdate();
      });
    });

    player.on('disconnect', function (player) {
      console.log('disconnected');
      sendPlayersUpdate();
    });
  });

  // function findMatchingPlayer(playerToMatch) {
  //   var playersInMatchRoom = Object.keys(io.sockets.adapter.rooms[MATCHING_ROOM].sockets);
  //
  //   var playerFindInterval = setInterval(function () {
  //     console.log('---interval---: ', playerToMatch.id);
  //     var foundPlayer = playersInMatchRoom.find(function (player) {
  //       return player !== playerToMatch.id;
  //     });
  //
  //     if (foundPlayer) {
  //       clearInterval(foundPlayer);
  //       io.sockets.sockets[foundPlayer].emit('terminateMatch');
  //       console.log(io.sockets.sockets[foundPlayer]);
  //       console.log('Found player:   ', foundPlayer);
  //       playerToMatch.leave(MATCHING_ROOM);
  //     }
  //   }, 500);
  //
  //
  //   playerToMatch.on('terminateMatch', function () {
  //     console.log('-------terminated------');
  //     clearInterval(playerFindInterval)
  //   });
  // }

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
