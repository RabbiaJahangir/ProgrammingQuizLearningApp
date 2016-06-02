/**
 * Created by Umer on 10/16/2015.
 */

/*jslint node:true*/

var players = [];
var connRequestQueue = [];

var foo = "Umer";
module.exports = function () {


    function storePlayer(socket) {
        players.push(socket);
        console.log("Player connected!");
        console.log("Total players: " + players.length + "\n");
    }

    function destroyPlayer(socket) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == socket.id) {
                players.splice(i, 1);
            }
        }
        for (var i = 0; i < connRequestQueue.length; i++) {
            if (connRequestQueue[i].id == socket.id) {
                connRequestQueue.splice(i, 1);
            }
        }
        console.log("Player disconnected!");
        console.log("Total players: " + players.length + "\n");
    }

// adds the player to the waiting list (connRequestQueue) and calls connectPlayer() for connecting to any player
    function addToWaiting(player) {
        console.log("Match request received");
        player.emit("wait", {waitMsg: "Please wait, Looking for an opponent...."});
        connRequestQueue.push(player);
        var res = connectPlayer(player);
        if (res != null) {
            console.log("Player matched");
            player.emit('matched', {matchedMsg: "Your opponent found"});
        }
    }

//connects the queued player (connRequestQueue) to connect, checks if there is atleast one player and then calls getAvailablePlayer to
//get the available player for matching and then calls the match() method for matching
    var pair = function pair(player1, player2) {
        this.player1 = player1;
        this.player1 = player2;
    }

    function connectPlayer(player) {
        var opponent = getAvailablePlayer();
        var found = 0;
        if (opponent) {
            for (var i = 0; i < connRequestQueue.length; i++) {
                if (connRequestQueue[i].id == player.id || connRequestQueue[i].id == opponent.id) {
                    connRequestQueue.splice(i, 1);
                    found++;
                    if (found == 2) {
                        break;
                    }
                }
            }
            return new pair(player, opponent);
        } else {
            return null;
        }
    }

    function getAvailablePlayer() {
        if (connRequestQueue.length > 1) {
            return connRequestQueue.pop();
        }
        else {
            return null;
        }
    }


    return {storePlayer: storePlayer, destroyPlayer: destroyPlayer, addToWaiting: addToWaiting}

}

