module.exports = function (app, user, questions, cat) {

  var User = user;
  var Questions = questions;
  var Categories = cat;

  // This route requires that Front End sends the categoryId as a parameter
  app.get('/questions', function (req, res) {
    var categoryId = req.query.categoryId;

    var categoryLevel = req.user.levels.find(function (levelObj) {
      return levelObj.category._id === categoryId;
    });

    var userCategoryLevel = categoryLevel && categoryLevel.level ? categoryLevel.level : 1;

    // Find the questions by the user level and the category he has selected
    Questions.find({category: categoryId, level: userCategoryLevel}, function (err, questions) {
      if (!err) {
        res.send(questions);
      } else {
        console.log(err);
      }
    });
  });

  app.post('/submit-single-player-results', function (req, res) {
    var categoryId = req.query.categoryId;
    var results = req.body.results;
    var noOfCorrectAnswers = 0;
    var correcAnswerQuestionIds = [];
    var defaultuserLevel = 1;
    const responseObj = {};

    results.forEach(function (result) {
      if (result.correct) {
        noOfCorrectAnswers++;
        correcAnswerQuestionIds.push(result.questionId);
      }
    });

    var categoryLevel = req.user.levels.find(function (levelObj) {
      return levelObj.category._id == categoryId; // Note: don't use triple equals here
    });

    // if user already has some level of that category then use that
    if (categoryLevel) {

      if (noOfCorrectAnswers === results.length) { // ***** If ALL answers were correct ******
        categoryLevel.level = defaultuserLevel + 1;
        categoryLevel.correct = correcAnswerQuestionIds;
        responseObj.success = true;

        // Update user's levels property
        req.user.levels = categoryLevel;
      } else {
        responseObj.success = false;
      }

      // Save user with updated level object
      req.user.save(function (err, user) {
        if (err) {
          throw err;
        }
        res.status(200).json(responseObj);
      });

    } else { // otherwise create a new object for user's levels object
      Categories.findOne({_id: categoryId}, function (err, category) {

        if (noOfCorrectAnswers === results.length) { // ***** If ALL answers were correct ******
          // ------ Add new level for new category WITH correct questionIds and INCREMENT in user level ------
          req.user.levels.push({
            level: defaultuserLevel + 1,
            category: category,
            correct: correcAnswerQuestionIds
          });
          responseObj.success = true;
        } else { // ***** If few / not ALL answers were correct ******
          // ------ Add new level for new category WITHOUT correct questionIds and DEFAULT user level ------
          req.user.levels.push({
            level: defaultuserLevel,
            category: category,
          });
          responseObj.success = false;
        }

        // Save user with updated level object
        req.user.save(function (err, user) {
          if (err) {
            throw err;
          }
          res.status(200).json(responseObj);
        });
      });
    }
  });
};