/**
 * Created by RabbiaUmer on 6/2/16.
 */

/*----Authentication code starts here----*/

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports = function () {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        user.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('signup-strategy', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        user.findOne({'email': email}, function (err, member) {
            if (err) {
                return done(err);
            }
            if (member) {
                return done(null, false);
            } else {
                var newPlayer = new user();
                newPlayer.email = email;
                newPlayer.password = newPlayer.createPasswordHash(password);
                newPlayer.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newPlayer);
                });
            }
        });
    }));

    passport.use('login-strategy', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        console.log("inside authentication");
        user.findOne({'email': email}, function (err, member) {
            if (err) {
                return done(err);
            }
            if (!member) {
                return done(null, false);
            }
            if (!member.comparePassword(password)) {
                return done(null, false);
            }
            return done(null, member);
        });
    }));

};


/*----Authentication code ends here----*/
