/**
 * Created by Rabbia on 11/10/2015.
 */
/* -----------Example document-------------
{
    "_id": {
        "$oid": "59a8c82126cc2800110005c7"
    },
    "avatar": "av_20",
    "password": "abcd",
    "email": "rabbia@gmail.com",
    "lastName": "Umer",
    "firstName": "Rabbia",
    "__v": 0
    "levels": {
        "category_id" : [{
            "level": 1,
            "correct": []
            }]
        ,
        "category_id#": [{
            "level": 1,
            "correct": []
            }]
    }
}
------------------------------------------
*/

var bcrypt = require('bcrypt');

module.exports = function (mongoose) {

  var user = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    avatar: String,
    levels: Object
  });

  user.methods.createPasswordHash = function (pass) {
    return bcrypt.hashSync(pass, 8);
  };

  user.methods.comparePassword = function (pass) {
    var isMatched = bcrypt.compareSync(pass, this.password);
    return isMatched;
  };

  return mongoose.model('User', user);
};