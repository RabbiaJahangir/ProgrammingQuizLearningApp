module.exports = function (app, user) {
  var User = user;

  // attach current user to request (req.user) for all subsequent routes
  app.use('/', function (req, res, next) {
    User.findOne({email: req.decoded._doc.email}, function (err, user) {
      if (!err) {
        req.user = user;
        next();
      }
    });
  });
};
