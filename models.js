/**
 * Created by Rabbia on 11/10/2015.
 */

var bcrypt = require('bcrypt');

module.exports = function (mongoose) {

    var user = mongoose.Schema({
        email: String,
        password: String
    });

    user.methods.createPasswordHash = function (pass) {
        return bcrypt.hashSync(pass, 8);
    };
    user.methods.comparePassword = function (pass) {
        var isMatched = bcrypt.compareSync(pass, this.password);
        return isMatched;
    };


    return {user: mongoose.model('User', user)};
}
