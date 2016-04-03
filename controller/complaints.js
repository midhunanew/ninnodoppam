var path = require('path');
var async = require('async');
var cwd = path.join(__dirname, "../");

var complaint = cwd + 'model/complaints';
var counters = cwd + 'model/counters';
var complaintCollection = require(complaint);
var countersCollection = require(counters);
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./ignore/ses.json');
var ses = new AWS.SES();

if (process.env.NODE_ENV !== 'production') {
    ses.sendEmail = function (data, cb) {
        logger.warn("No email is being sent, see console / log to use the verification link");
        cb(null, {"success": "you saved one email"});
    }
}

var logger = require('../core/logger').logger();

var config = require('config'),
stringConf = config.get('STRINGS');

function alertAdmins(mailContent){


    console.log("try here");
    // send to list
    var to = [stringConf.ADMIN_EMAILS];
    // this must relate to a verified SES account
    var from = stringConf.SES_VERIFIED_EMAIL;
    // this sends the email

    ses.sendEmail({
            Source: from,
            Destination: { ToAddresses: to },
            Message: {
                Subject: {
                    Data: 'Act Immediately'
                },
                Body: {
                    Html: {
                        Data: '<h1>'+mailContent+'</h1>'
                    },
                    Text: {
                        Data: mailContent //plain text email content
                    }
                }
            }
        }
        , function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response

            if (err) {
                console.log('error');
                console.log(err);
            }
            else {
                console.log('mail sent, data here');
                console.log(data);

                logger.info("emails - " + to + " : " + mailContent);
            }

        });
}

module.exports = {
    create: function (req, res, next) {
        console.log(req.body.data);

        if (req.body.data && req.body.data.text && req.body.data.identification) {
            var fromUser = {
                text: req.body.data.text,
                identification: req.body.data.identification
            };

            if (req.body.data.district && req.body.data.district.value) {
                fromUser.district = req.body.data.district.value;
            }
            if (req.body.data.assembly && req.body.data.assembly.value) {
                fromUser.assembly = req.body.data.assembly.value;
            }

            fromUser.history = [];

            fromUser.history.push({
                event: "received",
                eventNative:"പരാതി സമർപ്പിച്ചു.",
                date: Date.now(),
                author: 'Complainer',
                authorNative:"പരാതിക്കാരൻ"
            });

            var complaintData = {}, result = {};

            countersCollection.findOne({_id: "complaint"}, function (err, countersDoc) {
                console.log(err);
                console.log("countersDoc");
                console.log(countersDoc);
                if (err) {
                    res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                }
                else {
                    if(countersDoc){
                    console.log("countersDoc.seq");
                    console.log(countersDoc.seq);
                    console.log(typeof countersDoc.seq);
                    var prevComplaintNUmber = countersDoc.seq;
                    var nextComplaintNUmber = countersDoc.seq;

                    var notDone = true;
                    // see this here - https://github.com/caolan/async#whilst
                    async.whilst(
                        function () {
                            console.log(notDone);
                            return notDone;
                        },
                        function (callback) {
                            nextComplaintNUmber++;
                            console.log("count++", nextComplaintNUmber);
                            fromUser._id = nextComplaintNUmber;

                            complaintData = new complaintCollection(fromUser);
                            complaintData.save(function (err, complaintDoc) {
                                console.log("create complaint db callback");
                                if (err) {
                                    console.log(err);
                                    console.log(err.code);
                                    if (err.code === 11000) {
                                        callback(null, notDone);
                                    }
                                    else {
                                        callback(err, "failed");
                                    }
                                }
                                else {
                                    console.log(complaintDoc._id);
                                    result["status"] = true;
                                    result["error"] = false;
                                    req.body.data._id = complaintDoc._id;
                                    console.log(req.body.data);
                                    result["data"] = req.body.data;
                                    result["message"] = "പരാതി സ്വീകരിച്ചിരിക്കുന്ന ക്രമനമ്പർ:" + complaintDoc._id + ". തുടർനടപടികൾ വിലയിരുത്തുന്നതിന് ഈ നമ്പർ ഉപയോഗിക്കേണ്ടതാണ്.";
                                    notDone = false;
                                    callback(null, notDone);

                                }

                            });
                        },
                        function (err, n) {
                            console.log("err,n");
                            console.log(err, n);
                            if (err) {
                                res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                            }
                            else {
                                res.send(result);
                                var query = {_id: "complaint", seq: prevComplaintNUmber};
                                console.log("query");
                                console.log(query);
                                var options = {};
                                var updateQuery = {$set: {seq: nextComplaintNUmber}};
                                console.log("updateQuery");
                                console.log(updateQuery);
                                countersCollection.findOneAndUpdate(query, updateQuery, options,
                                    function (err, whatever) {
                                    }
                                );

                            }
                        }
                    );
                    }
                    else{
                        alertAdmins('complaint counter missing');
                        logger.warn("complaint saving failed");
                        logger.info(req.body.data);
                        res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                    }
                }
            });
        }
        else {
            res.send({status: false, error: null, message: "validation failed", data: req.body.data});
        }
    },
    receive:function (req, res, next) {
        if(req.params.id){
            var projection = {'text':1, 'identification':1, '_id':1, 'district':1, assembly:1};
            if(req.query.history){
                projection.history = 1;
            }
            complaintCollection.findOne({_id: req.params.id, status: {$ne: "deleted"}},projection, function (err, complaintDoc) {
                console.log(err);
                console.log("complaintDoc");
                console.log(complaintDoc);
                if (err) {
                    res.send({status: false, error: true, message: "db error occurred"});
                }
                else if(complaintDoc) {
                    res.send({status: true, error: false, message: "complaint found", data: complaintDoc});
                }
                else{
                    res.send({status: false, error: true, message: req.params.id+" നമ്പറിൽ പരാതി ഒന്നും നിലവിലില്ല!"});
                }
            });
        }
        else {
            res.send({status: false, error: null, message: "validation failed"});
        }
    },
    modify:function (req, res, next) {
        console.log(req.body.data);

        if (req.params.id && req.body.data && req.body.data.text && req.body.data.identification) {
            var fromUser = {
                text: req.body.data.text,
                identification: req.body.data.identification
            };

            if (req.body.data.district && req.body.data.district.value) {
                fromUser.district = req.body.data.district.value;
            }
            if (req.body.data.assembly && req.body.data.assembly.value) {
                fromUser.assembly = req.body.data.assembly.value;
            }

            var history = {
                event: "modified",
                eventNative: "പരാതി തിരുത്തി.",
                date: Date.now(),
                author: 'Complainer',
                authorNative:"പരാതിക്കാരൻ"
            };

            var query = {_id:req.params.id,status: {$ne: "deleted"}};
            console.log("query");
            console.log(query);
            var options = {new:true};
            var updateQuery = {$set: fromUser,$push: {history: history}};
            console.log("updateQuery");
            console.log(updateQuery);
            complaintCollection.findOneAndUpdate(query, updateQuery, options,
                function (err, complaintDoc) {
                    console.log(err);
                    console.log("complaintDoc");
                    console.log(complaintDoc);
                    if (err) {
                        res.send({status: false, error: true, message: "db error occurred"});
                    }
                    else if(complaintDoc){
                        res.send({status: true, error: false, message: req.params.id+" നമ്പറിലുള്ള പരാതിയുടെ തിരുത്തലുകൾ സ്വീകരിച്ചിരിക്കുന്നു.", data: complaintDoc});
                    }
                    else {
                        res.send({status: false, error: true, message: "complaint not found"});
                    }
                }
            );
        }
        else {
            res.send({status: false, error: null, message: "validation failed", data: req.body.data});
        }
    },

    withdraw:function (req, res, next){
        if(req.params.id){

            var query = {_id: req.params.id,status: {$ne: "deleted"}};
            console.log("query");
            console.log(query);
            var options = {new:true};
            var updateQuery = {$set: {status: "deleted"}};
            console.log("updateQuery");
            console.log(updateQuery);
            complaintCollection.findOneAndUpdate(query, updateQuery, options,
                function (err, complaintDoc) {
                console.log(err);
                console.log("complaintDoc");
                console.log(complaintDoc);
                if (err) {
                    res.send({status: false, error: true, message: "db error occurred"});
                }
                else if(complaintDoc) {
                    res.send({status: true, error: false, message: req.params.id+" നമ്പർ പരാതി പിൻവലിച്ചു."});
                }
                else{
                    res.send({status: false, error: true, message: req.params.id+" നമ്പറിൽ പരാതി ഒന്നും നിലവിലില്ല!"});
                }
            });
        }
        else {
            res.send({status: false, error: null, message: "validation failed"});
        }
    }
}