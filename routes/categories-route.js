/**
 * Created by Rabbia Umer on 7/14/16.
 */

module.exports = function (app, cat) {

  app.get('/categories', function (req, res) {

    cat.find({}, function (err, cats) {
      if (!err) {
        res.send(cats);
      }
    });

  });
};