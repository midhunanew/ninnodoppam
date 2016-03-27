var express = require('express');

var router = new express.Router();
var complaints = require('./../controller/complaints');

console.log("from complaints router");

//for complaints list
router.post('/', function (req, res, next) {
    console.log("create complaints in complaints router");
    complaints.create(req, res, next);
});

//get one complaints by id
router.get('/:id', function (req, res, next) {
    console.log("get complaint in complaints router");
    complaints.receive(req, res, next);
});

//update one complaint by id
router.post('/:id', function (req, res, next) {
    console.log("modify complaint in complaints router");
    complaints.modify(req, res, next);
});

//delete one complaint by id
router.delete('/:id', function (req, res, next) {
    console.log("delete complaint in complaints router");
    complaints.withdraw(req, res, next);
});

module.exports = router;
