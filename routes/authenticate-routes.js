/**
 * Created by RabbiaUmer on 6/2/16.
 */

module.exports = function (app, passport) {

//Authentication middleware function for checking on each get and post request if the user is already logged in or not

  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    else {
      res.send('/notLoggedIn');
    }
  }

  function authenticateUser(req, res, next) {
    if (req.isAuthenticated())
      res.json({authenticated: "true"});
    else
      res.json({authenticated: "false"});
  }

  app.get('/authenticate', authenticateUser);

  app.get('/profile', function (req, res) {
    res.send('User Profile page');
  });

  app.get('/signup', isAuthenticated, function (req, res) {
    res.send('User profile page');
  });

  app.get('/login', isAuthenticated, function (req, res) {
    res.send('User profile page');
  });

//app.post('/login', passport.authenticate('login-strategy', {
//    successRedirect: '/profile',
//    failureRedirect: '/failedLogin',
//}));
//app.post('/signup', passport.authenticate('signup-strategy', {
//    successRedirect: '/profile',
//    failureRedirect: '/signup',
//}));

  app.post('/login', function (req, res, next) {
    passport.authenticate('login-strategy', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json({loggedIn: "false"});
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.json({loggedIn: "true"});
      });
    })(req, res, next);
  });

  app.post('/signup', function (req, res, next) {
    passport.authenticate('signup-strategy', function (err, user, info) {

      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json({signedUp: "false"});
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.json({signedUp: "true"});
      });
    })(req, res, next);
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.json({loggedOut: "true"});
  });

};

