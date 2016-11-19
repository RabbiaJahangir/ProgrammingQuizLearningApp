/**
 * Created by Rabbia Umer on 7/14/16.
 */


module.exports = function (mongoose) {

  var categories = mongoose.Schema({
    name: String
  });

  return mongoose.model('Categories', categories);
};