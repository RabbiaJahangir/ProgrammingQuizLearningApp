module.exports = function (app, user, questions) {

  var User = user;
  var Questions = questions;

  // This route requires that Front End sends the categoryId as a parameter
  app.get('/questions', function (req, res) {
    var userEmail = req.decoded._doc.email;
    var query = req.query;

    // Finding record for the current user in DB, to get the current level of the user/player
    User.findOne({email: userEmail}, function (err, user) {
      if (!err) {

        // Find the questions by the user level and the category he has selected
        Questions.find({category: query.categoryId, level: (user.level + 1)}, function (err, questions) {
          if (!err) {
            res.send(questions);
          } else {
            console.log(err);
          }
        });

      } else {
        console.log(err);
      }
    });
  });
};