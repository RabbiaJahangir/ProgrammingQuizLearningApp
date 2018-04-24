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
      sendTotalPlayersUpdate();
      sendFreePlayersUpdate();

      player.on('matchPlayer', function () {
        player.leave(ALL_PLAYERS_ROOM, function () {
          player.join(MATCHING_ROOM, function () {
            console.log('joined ', MATCHING_ROOM);
            sendTotalPlayersUpdate();
            sendFreePlayersUpdate();

          });
        });
      });
    });

    player.on('leaveMatch', function () {
      player.leave(MATCHING_ROOM, function () {
        player.join(ALL_PLAYERS_ROOM);
        sendTotalPlayersUpdate();
        sendFreePlayersUpdate();
      });
    });

    player.on('disconnect', function (player) {
      console.log('disconnected');
      sendTotalPlayersUpdate();
      sendFreePlayersUpdate();
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

  function sendFreePlayersUpdate() {
    var freePlayers = getFreePlayers();
    var ids = freePlayers ? freePlayers.sockets : {};
    var count = freePlayers ? Object.keys(freePlayers.sockets).length : 0;
    io.emit('freePlayers', {playerIds: ids, count: count})
  }

  function sendTotalPlayersUpdate() {
    var totalPlayers = getTotalPlayers();
    io.emit('totalPlayers', {playerIds: totalPlayers, count: totalPlayers.length})
  }
}
