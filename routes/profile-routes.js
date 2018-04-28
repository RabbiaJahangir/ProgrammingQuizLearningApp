/**
 * Created by rabbiaumer
 */


module.exports = function (app, user, jwt) {

  var helper = require('../helper'),
    User = user;

  // var profile = require('./../models/user')(mongoose);

  app.get('/user-profile', function (req, res) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var host = req.headers.host;

    User.findOne({'email': req.decoded._doc.email}, function (err, doc) {
      if (err) {
        return res.send({
          success: false,
          message: "failed"
        });
      }
      doc.avatar = helper.generateAvatarLink(doc.avatar, host);
      res.send(doc);
    });
  });

  app.get('/avatar', function (req, res) {
    var avatarLink = helper.generateAvatarLink(req.query.avatar, req.headers.host);
    res.send(avatarLink);
  });

  app.post('/set-avatar', function (req, res) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var host = req.headers.host;


    User.findOne({'email': req.decoded._doc.email}, function (err, doc) {
      if (err)
        return res.send({
          success: false,
          message: "failed"
        });

      doc.avatar = req.body.avatarName;
      doc.save(function (err) {
        if (err) {
          res.send({
            success: false,
            message: "failed"
          });
        }
        else {
          res.send({
            success: true,
            message: "success"
          });
        }
      });

    });
  });

};