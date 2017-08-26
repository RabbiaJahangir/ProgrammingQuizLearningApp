module.exports = function (app) {


  app.get('/questions', function (req, res) {
    res.send(req.decoded);
  });
};