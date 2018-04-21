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
      sendFreePlayersUpdate();

      player.on('matchPlayer', function () {
        sendTotalPlayersUpdate()
        sendFreePlayersUpdate();

        player.leave(ALL_PLAYERS_ROOM, function () {
          console.log('removed from ', ALL_PLAYERS_ROOM);

          player.join(MATCHING_ROOM, function () {
            console.log('joined ', MATCHING_ROOM);
          });
        });
      });
      console.log(Object.keys(io.sockets.connected).length);
    });

    player.on('disconnect', function (player) {
      console.log('disconnected');
      sendTotalPlayersUpdate();
      sendFreePlayersUpdate();
    });
  });


  function getFreePlayers() {
    var freePlayers = [];
    var socketsConnectedToAllPlayers = io.in(ALL_PLAYERS_ROOM).connected;
    Object.keys(socketsConnectedToAllPlayers).forEach(function (socket) {
      freePlayers.push(socketsConnectedToAllPlayers[socket].id);
    });
    return freePlayers;
  }

  function getTotalPlayers() {
    return Object.keys(io.sockets.connected);
  }

  function sendFreePlayersUpdate() {
    io.emit('updateFreePlayers', {players: getFreePlayers()})
  }

  function sendTotalPlayersUpdate() {
    var totalPlayers = getTotalPlayers();
    io.emit('totalPlayers', {playerIds: totalPlayers, count: totalPlayers.length})
  }
}
