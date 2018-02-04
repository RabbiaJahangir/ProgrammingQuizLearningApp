module.exports = function (app, user, questions, cat) {

  var User = user;
  var Questions = questions;
  var Categories = cat;

  // This route requires that Front End sends the categoryId as a parameter
  app.get('/questions', function (req, res) {
    var query = req.query;

    var categoryLevel = req.user.levels.find(function (levelObj) {
      levelObj.category._id === query.categoryId;
    });

    var userCategoryLevel = categoryLevel && categoryLevel.level ? categoryLevel.level : 1;

    // Find the questions by the user level and the category he has selected
    Questions.find({category: query.categoryId, level: userCategoryLevel}, function (err, questions) {
      if (!err) {
        res.send(questions);
      } else {
        console.log(err);
      }
    });
  });
};