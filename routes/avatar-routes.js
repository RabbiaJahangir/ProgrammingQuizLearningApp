/**
 * Created by rabbiaumer on 8/3/16.
 */

var avatarRefs = require('../configs/avatar');

module.exports = function (app) {

    app.get('/chooseAvatar', function (req, res) {
        var avatarLinks = [];
        for (var avatar in avatarRefs) {
            avatarLinks.push(avatarRefs[avatar].link);
        }
        res.send(avatarLinks);
    });

};