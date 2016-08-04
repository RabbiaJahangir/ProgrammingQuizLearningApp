/**
 * Created by Rabbia Umer on 7/14/16.
 */

var bcrypt = require('bcrypt');

module.exports = function (mongoose) {

    var user = mongoose.Schema({
        name: String
    });

    return mongoose.model('Categories', categories);
};