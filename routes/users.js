var express = require('express');

var router = new express.Router();
var users = require('./../controller/users');

console.log("from users router");

//send OTP to phone
router.post('/phone', function (req, res, next) {
    console.log("send sms to phone in users router");
    users.sendSMS(req, res, next);
});

//send OTP via email
router.post('/email', function (req, res, next) {
    console.log("send email in users router");
    users.sendEmail(req, res, next);
});

//automated session creation call
router.get('/token/:id', function (req, res, next) {
    console.log("check otp status in users router");
    users.OTPStatus(req, res, next);
});

//otp verification link clicked
router.get('/verify/:id', function (req, res, next) {
    console.log("verify link in users router");
    users.verifyOTP(req, res, next);
});

//facebook callback
router.post('/fbcallback', function (req, res, next) {
    console.log("receive fb details in users router");
    users.facebookAccess(req, res, next);
});

//check facebook callback
router.get('/fbcallback/:token', function (req, res, next) {
    console.log("verify receive fb details in users router");
    users.facebookAccess(req, res, next);
});

module.exports = router;

