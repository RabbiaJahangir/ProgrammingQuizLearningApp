module.exports = function (mongoose) {

  var questions = mongoose.Schema({
    question: String,
    answer: String,
    level: Number,
    choices: Array,
    category: String
  });

  return mongoose.model('Questions', questions);
};