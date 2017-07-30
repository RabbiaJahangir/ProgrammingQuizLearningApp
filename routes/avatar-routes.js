/**
 * Created by rabbiaumer on 8/3/16.
 */

var helper = require('../helper'),
  avatarRefs = require('../configs/avatar');

module.exports = function (app) {

  app.get('/chooseAvatar', function (req, res) {
    var host = req.headers.host;
    var avatarLinks = [];
    for (var avatar in avatarRefs) {
      avatarLinks.push({
        avatarUrl: helper.generateAvatarLink(avatar, host),
        avatarName: avatar
      });
    }
    res.send(avatarLinks);
  });
};