module.exports = function (io, socketioJwt, credentials) {

// to authorize the socket connections
  io.set('authorization', socketioJwt.authorize({
    secret: credentials.secret,
    handshake: true
  }));

  /* we will use the default namespace of '/'
   *  But as soon as the player is authenticated and connected, we will add him to allPlayers room
   */

  io.on('connect', function (player) {
    // player has been connected, now let him join allPlayers room

    player.join('allPlayers', function () {
      // emit playersRoomJoined event
      player.emit('playersRoomJoined', {})
    })

    player.on('disconnect', function (player) {
      console.log('player disconnected');
    });
  });

};