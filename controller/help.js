/* The following lines include jsHint overrides */
/*jshint strict:false */
/*global module, console, require, exports, __dirname */
//var crypto = require('crypto');
//var uuid = require('node-uuid');//generate token
//var sha1 = require('sha1');//create hash of token
var path = require('path');
var cwd = path.join(__dirname, "../");

var help = cwd + 'model/help';
var helpCollection = require(help);

/**
 * For creating the encrypted password
 * @param: password.
 * @return: encrypted password.
 **/
/*function encryptPass(word) {
 if (word) {
 return crypto.createHmac('SHA256', word).digest("hex");
 }
 }*/

module.exports = {
    create: function (req, res, next) {
        if (req.body.data && req.body.data.phone && req.body.data.phone === req.body.data.dup_phone) {
            var helpData = new helpCollection(req.body.data), result = {};
            helpData.save(function (err, helpDoc) {
                if (err) {
                    console.log(err);
                    res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                }
                else {
                    console.log(helpDoc);
                    result["status"] = true;
                    result["error"] = false;
                    result["data"] = req.body.data;
                    result["message"] = "ശ്രമം പൂർത്തിയായിരിക്കുന്നു., നിങ്ങളുടെ സ്ഥലത്തെ സന്നദ്ധസേവകന്‍ എത്രയും വേഗം നിങ്ങളെ സന്ദർശിക്കുന്നതാണ്.";
                    res.send(result);
                }
            });
            /*res.send({
             status: false,
             message: '<span style="text-align: center; display: block;">You must update to continue. </span>'+
             '<div class="register">' +
             '<button onclick="cordova.InAppBrowser.open(\'market://details?id=com.tapbueno.bueno\', \'_blank\', \'location=no\');" style="width: 100%; margin: 11px 0px 0px;" ' +
             ' class="button button-positive" >To Google Play Store </button>' +
             '<button onclick="cordova.InAppBrowser.open(\'itms-apps://itunes.apple.com/app/id1015657569\', \'_blank\', \'location=no\');" style="width: 100%; margin: 11px 0px 0px;" ' +
             ' class="button button-positive" >To App Store </button>' +
             '</div>' +
             '<style>' + '.popup-buttons,.popup-head{display:none;}</style>'
             })*/
        }
        else {
            res.send({status: false, error: null, message: "validation failed", data: req.body.data});
        }
    },
    getFeedbacks: function (req, res) {
        var status;
        var populateQuery = [
            {path: 'userId', select: 'firstName lastName email phone'}

        ];
        feedbacksDB.find().populate(populateQuery).exec(function (err, feedbacks) {
            if (err) {
                status = {status: false, error: err, message: 'db error'};
                res.send(status);
            }
            else if (feedbacks) {
                res.render('feedbacks', {feedbacks: feedbacks, title: 'Bueno Admin', role: req.session.role});
            }
            else {
                status = {status: true, data: feedbacks, message: 'no feedbacks found'};
                res.send(status);
            }
        });

    }
};