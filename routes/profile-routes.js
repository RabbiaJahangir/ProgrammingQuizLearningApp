/**
 * Created by rabbiaumer
 */


module.exports = function (app, mongoose, jwt) {

  var helper = require('../helper');

  // var profile = require('./../models/user')(mongoose);

  app.get('/user-profile', function (req, res) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decodedToken = jwt.decode(token);
    var host = req.headers.host;

    var userInfo = {
      email: decodedToken._doc.email,
      firstName: decodedToken._doc.firstName,
      lastName: decodedToken._doc.lastName,
      level: decodedToken._doc.level,
      avatar: helper.getAvatarName(decodedToken._doc.avatar, host)
    };

    res.send(userInfo);
  });

};