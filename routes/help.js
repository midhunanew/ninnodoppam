var express = require('express');

var router = new express.Router();
var help = require('./../controller/help');

console.log("from help router");

//app.get('path/:required/:optional?*, ...)

//This should work for path/meow, path/meow/voof, path/meow/voof/moo/etc...

//res.send(req.originalUrl + '\n');

//for help list
router.post('/', function (req, res, next) {
    console.log("create help in help router");
    help.create(req, res, next);
});

module.exports = router;
