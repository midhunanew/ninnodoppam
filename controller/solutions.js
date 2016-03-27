var path = require('path');
var async = require('async');
var cwd = path.join(__dirname, "../");

var complaint = cwd + 'model/complaints';
var solutions = cwd + 'model/solutions';
var complaintCollection = require(complaint);
var solutionsCollection = require(solutions);

module.exports = {
    create: function (req, res, next) {
        console.log(req.body.data);
        if(req.body.complaintId && req.body.text){
            complaintCollection.findOne({_id: req.body.complaintId, status: {$nin: ["deleted","resolved"]}}, function (err, complaintDoc) {
                console.log(err);
                console.log("complaintDoc");
                console.log(complaintDoc);
                if (err) {
                    res.send({status: false, error: true, message: "db error occurred"});
                }
                else if(complaintDoc) {
                    var solutionData = new solutionsCollection(
                        {
                            complaintId: req.body.complaintId,
                            text:req.body.text
                        }
                    ), result = {};
                    solutionData.save(function (err, solutionDoc) {
                        console.log("create solution db callbackX");
                        console.log(err);
                        console.log(solutionDoc);
                        if (err) {
                            res.send({status: false, error: true, message: "db error occurred"});
                        }
                        else {
                            console.log(solutionDoc._id);
                            result["status"] = true;
                            result["error"] = false;
                            result["message"] =  complaintDoc._id + " നമ്പറിലെ പരാതിക്ക്  താങ്കളുടെ പരിഹാരം നിർദ്ദേശിക്കപ്പെട്ടിരിക്കുന്നു.";
                            console.log(result);
                            res.send(result);
                        }
                    });
                }
                else{
                    res.send({status: false, error: true, message: req.params.id+" നമ്പറിലെ പരാതിക്ക് പരിഹാരം നിർദ്ദേശിക്കുവാൻ സാദ്ധ്യമല്ല!"});
                }
            });
        }
        else {
            res.send({status: false, error: null, message: "validation failed"});
        }
    }
};