/**
 * Created by rabbiaumer on 8/3/16.
 */

var avatarRefs = require('../configs/avatar');

module.exports = function (app) {

  app.get('/chooseAvatar', function (req, res) {
    var host = req.headers.host;
    var avatarLinks = [];
    for (var avatar in avatarRefs) {
      avatarLinks.push("http://" + host + "/" + avatarRefs[avatar].link);
    }
    res.send(avatarLinks);
  });

};