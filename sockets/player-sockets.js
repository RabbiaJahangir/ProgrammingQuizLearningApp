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

    // console.log('hello! ', player.request.decoded_token);

    // player has been connected, now let him join allPlayers room

    player.join(ALL_PLAYERS_ROOM, function () {
      // emit playersRoomJoined event
      // player.emit('playersRoomJoined');

      // console.log(player.rooms);
      // console.log(player.id);

      // player.emit('totalPlayers', {totalPlayers:Object.})
      // console.log(io.sockets.clients(ALL_PLAYERS_ROOM));
      // console.log(io.sockets.adapter.rooms[ALL_PLAYERS_ROOM].length);
    });

    console.log('player connected');

    player.emit('connectedObj', util.inspect(player));

    player.on('disconnect', function (player) {
      console.log('player disconnected');
    });

  });

};