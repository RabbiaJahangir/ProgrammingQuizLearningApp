/**
 * Created by RabbiaUmer on 6/2/16.
 */

module.exports = function (app, express, jwt, mongoose) {

  var User = require('./../models/user')(mongoose);

  // get an instance of the router for auth routes
  var authRoutes = express.Router();

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  authRoutes.post('/authenticate', function (req, res) {
    // find the user
    User.findOne({
      email: req.body.email
    }, function (err, user) {

      if (err) throw err;

      if (!user) {
        res.json({success: false, message: 'Authentication failed. User not found.'});
      } else if (user) {

        // check if password matches
        if (user.password !== req.body.password) {
          res.json({success: false, message: 'Authentication failed. Wrong password.'});
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign(user, app.get('superSecret'), {
            expiresInMinutes: 1440 // expires in 24 hours
          });

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }

      }

    });
  });

  // route middleware to verify a token
  authRoutes.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // Note: the above req.body object is attached by bodyParser from the body parser middleware in app.js

    // decode token
    if (token) {

      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function (err, decoded) {
        if (err) {
          return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }
  });


  app.use('/auth', authRoutes);

};

