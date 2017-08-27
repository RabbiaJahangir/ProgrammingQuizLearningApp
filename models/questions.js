module.exports = function (mongoose) {

  var questions = mongoose.Schema({
    questions: String,
    answers: Array,
    level: Number,
    category: String
  });

  return mongoose.model('Questions', questions);
};