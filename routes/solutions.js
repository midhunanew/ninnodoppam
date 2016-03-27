var express = require('express');

var router = new express.Router();
var solutions = require('./../controller/solutions');

console.log("from solutions router");

//for solution create
router.post('/', function (req, res, next) {
    console.log("create solutions in solutions router");
    solutions.create(req, res, next);
});


module.exports = router;
