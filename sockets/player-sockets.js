var util = require('util')

module.exports = function (io, socketioJwt, credentials) {

  var ALL_PLAYERS_ROOM = 'allPlayers'; // name for room of all players

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
    // console.log('hello! ', player.request.decoded_token);

    // player has been connected, now let him join allPlayers room
    player.join(ALL_PLAYERS_ROOM, function () {
      sendFreePlayersUpdate();
    });

    player.on('disconnect', function (player) {
      console.log('disconnected');
      sendFreePlayersUpdate();
    });

    player.on('matchPlayer', function () {
      sendFreePlayersUpdate(player);
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

  function sendFreePlayersUpdate() {
    io.emit('updateFreePlayers', {players: getFreePlayers()})
  }
};
