/**
 * Created by Rabbia Umer on 7/14/16.
 */
var cat = require('../models/categories');

module.exports = function (app) {
    app.get('/categories', function (req, res) {
        cat.find({}, ['name'], function (err, cats) {
            if (!err) {
                res.send(cats);
            }
        });
    });
}