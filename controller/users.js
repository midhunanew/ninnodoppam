/* The following lines include jsHint overrides */
/*jshint strict:false */
/*global module, console, require, exports, __dirname */

const uuid = require('node-uuid');//generate token
const sha1 = require('sha1');//create hash of token
//var graph = require('fbgraph');
var FB = require('fb');

var path = require('path');
var cwd = path.join(__dirname, "../");

var otp = cwd + 'model/otp';
var user = cwd + 'model/user';
var otpCollection = require(otp);
var userCollection = require(user);

/*var crypto = require('crypto'),//password encryption

 function encryptPass(password) {
 if (password) {
 var encryptedPassword = crypto.createHmac('SHA256', password).digest("hex");
 return encryptedPassword;
 }
 };

 var bcrypt = require('bcrypt');

 function encryptPass(word) {
 if (word) {
 return crypto.createHmac('SHA256', word).digest("hex");
 }
 }

 crypto.randomBytes(20, function(err, buf) {
 if(err){
 done(err, null);
 } else {
 var token = buf.toString('hex');
 done(null, token);
 }
 });

 bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
 if (err){
 res.send({loggedIn: false, error: err});
 }
 else{
 bcrypt.hash(password, salt, null, function(err, hash) {


 var hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
 console.log("hash");
 console.log(hash);
 bcrypt.compare(hash, userDoc.services.password.bcrypt, function (err, passwordMatched) {


 "secret": Random.id(),
 "key": Random.secret(),

 */

var config = require('config'),
    domainConf = config.get('URL'),
    numberConf = config.get('NUMBERS'),
    stringConf = config.get('STRINGS');


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./ignore/ses.json');


var ses = new AWS.SES();

if (process.env.NODE_ENV !== 'production') {
    ses.sendEmail = function (data, cb) {
        logger.warn("No email is being sent, see console / log to use the verification link");
        cb(null, {"success": "you saved one email"});
    }
}

const Random = require('meteor-random');
const crypto = require('crypto');
const async = require('async');

var logger = require('../core/logger').logger();

function getNewToken() {
    var token = uuid.v1();
    var hash = sha1(token);

    return {
        token: token,
        hash: hash
    };
}

function createNewOTP(id, type, cb) {

    var secret, hash, otpId,
        otpUserData = {
            type: type
        };

    if (type === 'email') {
        otpUserData.date = Date.now() + numberConf.EMAIL_VERIFICATION_DELAY;
        otpUserData.email = id;
    }
    else {
        otpUserData.date = Date.now() + numberConf.SMS_VERIFICATION_DELAY;
        otpUserData.phone = id;
    }

    console.log("otpUserData.date");
    console.log(otpUserData.date);

    var notDone = true, otpData;
    async.whilst(
        function () {
            console.log(notDone);
            return notDone;
        },
        function (callback) {
            if (type === 'email') {
                secret = Random.secret();
            }
            else {
                secret = Random.id();
            }
            console.log("secret++", secret);
            otpUserData.secret = secret;

            otpData = new otpCollection(otpUserData);
            otpData.save(function (err, otpDoc) {
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
                    otpId = otpDoc._id;
                    console.log(otpDoc._id);
                    notDone = false;
                    callback(null, notDone);
                }

            });
        },
        function (err, n) {
            console.log("err,n");
            console.log(err, n);
            if (err) {
                console.log(err);
                cb(err, null);
            }
            else {

                if (type === 'email') {
                    hash = crypto.createHmac('sha256', secret)
                        .update(id)
                        .digest('hex');
                }
                else {
                    hash = crypto.createHash('md5').update(secret).digest('hex');
                }
                var query = {_id: otpId};
                console.log("query");
                console.log(query);
                var options = {new: true};
                var updateQuery = {$set: {
                    hash: hash,
                    status: "hashed"
                }};
                console.log("updateQuery");
                console.log(updateQuery);
                otpCollection.findOneAndUpdate(query, updateQuery, options, cb);
            }
        }
    );

}

module.exports = {

    sendSMS: function (req, res, next) {
        console.log(req.body);
        if (req.body.data && req.body.data.phone) {
            createNewOTP(req.body.data.phone, 'phone', function (err, otpDoc) {
                if (err) {
                    console.log(err);
                    res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                }
                else {
                    //todo -don't forget to send OTP! and mark status as "send"
                    if (otpDoc) {
                        //that's cool
                        console.log("create Link with " + otpDoc.hash);
                        console.log(domainConf.ROOT_URL + "/users/verify/" + otpDoc.hash);
                        res.send({
                            status: true,
                            error: false,
                            message: "please open the link you received on " + req.body.data.phone,
                            data: {
                                phone: req.body.data.phone,
                                verify: otpDoc._id,
                                type: "phone"
                            }
                        });
                    }
                    else {
                        res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                    }
                }
            })
        }
        else {
            res.send({status: false, error: null, message: "validation failed", data: req.body.data});
        }
    },

    sendEmail: function (req, res, next) {
        if (req.body.data && req.body.data.email) {
            createNewOTP(req.body.data.email, 'email', function (err, otpDoc) {

                var verificationLink, mailContent;

                if (err) {
                    console.log(err);
                    res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                }
                else {
                    //todo - in HTML, add sliced images from server with style float to display message in Native.
                    if (otpDoc) {
                        //that's cool
                        verificationLink = domainConf.ROOT_URL + "/users/verify/" + otpDoc.hash;
                        mailContent = "Please click the link below to verify your email:<br/>" + verificationLink;

                        console.log("try here");
                        // send to list
                        var to = [req.body.data.email];
                        // this must relate to a verified SES account
                        var from = stringConf.SES_VERIFIED_EMAIL;
                        // this sends the email

                        ses.sendEmail({
                                Source: from,
                                Destination: { ToAddresses: to },
                                Message: {
                                    Subject: {
                                        Data: 'Confirm your email'
                                    },
                                    Body: {
                                        Html: {
                                            Data: mailContent
                                        },
                                        Text: {
                                            Data: verificationLink //plain text email content
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
                                    res.send({status: false, error: err, message: 'mail sending failed'});
                                }
                                else {
                                    console.log('mail sent, data here');
                                    console.log(data);

                                    logger.info("email - " + req.body.data.email + " : " + verificationLink);

                                    var query = {_id: otpDoc._id};
                                    console.log("query");
                                    console.log(query);
                                    var options = {new: true};
                                    var updateQuery = {$set: {
                                        status: "send"
                                    }};
                                    console.log("updateQuery");
                                    console.log(updateQuery);
                                    otpCollection.findOneAndUpdate(query, updateQuery, options, function (err, assumes) {
                                        if (err) {
                                            logger.info("updating status failed for email - " + req.body.data.email);
                                            console.log('error');
                                            console.log(err);
                                        }
                                        else {
                                            res.send({
                                                status: true,
                                                error: false,
                                                message: "please open the link you received on " + req.body.data.email,
                                                data: {
                                                    email: req.body.data.email,
                                                    verify: otpDoc._id,
                                                    type: "email"
                                                }
                                            });
                                        }
                                    });
                                }

                            });
                    }
                    else {
                        res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                    }
                }
            })
        }
        else {
            res.send({status: false, error: null, message: "validation failed", data: req.body.data});
        }
    },

    verifyOTP: function (req, res, next) {
        if (req.params.id) {
            otpCollection.findOne({hash: req.params.id, status: "send"}, function (err, otpDoc) {
                var query, options, updateQuery;
                if (err) {
                    console.log(err);
                    //res.send({status: false, error: true, message: "db error occurred", data: req.body.data});
                    res.redirect('/err.html');
                }
                else {
                    if (otpDoc) {
                        // todo - create user, mark relevant field as verified
                        if (otpDoc.date < Date.now()) {
                            console.log("expired");
                            res.redirect('/err.html');
                        }
                        else {
                            var userData = {
                                token: [
                                    {
                                        "hashedToken": Random.id()
                                    }
                                ]
                            };

                            //handling if the email / phone was already verified - !!!

                            if (otpDoc.type === 'email') {
                                userData.email = otpDoc.email;
                                query = {email: otpDoc.email};
                            }
                            else {
                                userData.phone = otpDoc.phone;
                                query = {phone: otpDoc.phone};
                            }

                            options = {new: true, upsert: true};
                            updateQuery = {
                                $set: userData
                            };
                            userCollection.findOneAndUpdate(query, updateQuery, options,
                                function (err, userData) {
                                    if (err) {
                                        console.log(err);
                                        res.redirect('/err.html');
                                    }
                                    else {
                                        query = {hash: req.params.id, status: "send"};
                                        options = {new: true};
                                        updateQuery = {
                                            $set: {
                                                status: "verified",
                                                userId: userData._id
                                            }
                                        };
                                        otpCollection.findOneAndUpdate(query, updateQuery, options,
                                            function (err, assumes) {
                                                if (err) {
                                                    res.redirect('/err.html');
                                                }
                                                else {
                                                    res.redirect('/quotes.html');
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                    else {
                        console.log("not found");
                        res.redirect('/err.html');
                    }
                }
            });
        }
        else {
            // bad request
            //res.status(400).send({status: false, error: null, message: "validation failed"});
            console.log("validation failed");
            res.redirect('/err.html');
        }
    },

    OTPStatus: function (req, res, next) {
        if (req.params.id) {
            otpCollection.findOne({_id: req.params.id}, function (err, otpDoc) {
                if (err) {
                    console.log(err);
                    res.status(500).send({status: false, error: null, message: "db error occurred"});
                }
                else {
                    if (otpDoc) {
                        switch (otpDoc.status) {
                            case 'verified':
                                // created
                                console.log("create new token, change status to 'deleted'");
                                var token = getNewToken();
                                userCollection.findOneAndUpdate(
                                    {_id: otpDoc.userId},
                                    {
                                        $push: {
                                            token: {
                                                date: Date.now(),
                                                hashedToken: token.hash
                                            }
                                        }
                                    },
                                    {
                                        new: true
                                    },
                                    function (err, userDoc) {
                                        if (err) {
                                            console.log(err);
                                            res.status(500).send({status: false, error: null, message: "db error occurred"});
                                        }
                                        else {
                                            otpCollection.findOneAndUpdate(
                                                {_id: req.params.id},
                                                {
                                                    $set: {
                                                        status: "deleted"
                                                    }
                                                },
                                                {},
                                                function (err, otpDoc2) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.status(500).send({status: false, error: null, message: "db error occurred"});
                                                    }
                                                    else {
                                                        //just for testing, see above we have skipped this checking
                                                        if (!userDoc) {
                                                            userDoc = {};
                                                        }
                                                        res.status(201).send(
                                                            {
                                                                status: true,
                                                                error: null,
                                                                message: "one time token received",
                                                                data: {
                                                                    token: token.token,
                                                                    user: {
                                                                        email: userDoc.email,
                                                                        phone: userDoc.phone
                                                                    }
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    });
                                break;
                            case 'send':
                                // accepted
                                res.status(202).send({status: false, error: null, message: "user hasn't opened link"});
                                break;
                            case 'deleted':
                                // gone
                                res.status(410).send({status: false, error: null, message: "token used"});
                                break;
                            case 'expired':
                                //timeout
                                res.status(408).send({status: false, error: null, message: "token invalid"});
                                break;
                            case 'hashed':
                                // pre-condition failed
                                res.status(412).send({status: false, error: null, message: "otp sending failed, please request new"});
                                break;
                            default:
                                // un-authorized
                                res.status(401).send({status: false, error: null, message: "just get out"});
                                break;
                        }
                    }
                    else {
                        // bas request
                        res.status(400).send({status: false, error: null, message: "otp not exists"});
                    }
                }
            });
        }
        else {
            // bad request
            res.status(400).send({status: false, error: null, message: "validation failed"});
        }
    },

    /**
     * Usersignup and login using facebook.
     * @param: access token from facebook.
     * @return: saved users information and a token.
     **/
    facebookAccess: function (req, res) {
        var accessToken = req.body.access_token;

        if (!accessToken) {
            accessToken = req.params.token;
        }
        var result = {};
        if (accessToken) {
            logger.info("facebookAccess " + accessToken);
            var responseToken, responded = false;
            //method for get user information from fb by passing access token.
            var status;
            FB.setAccessToken(accessToken);
            FB.api(
                "/v2.5/me?fields=id,name,email,birthday,currency,age_range,first_name,about,bio,gender,cover,inspirational_people,hometown,education,interested_in,languages,last_name,picture,locale", {
                    //access_token: accessToken,
                    //fields:  "birthday",
                    format: "json"
                },
                function (response) {
                    console.log("response");
                    console.log(response);
                    logger.info(response);

                    if (response.error) {
                        status = {status: false, error: "wrong access token"};
                        res.send(status);
                    }
                    else {
                        if (!response.email) {
                            responded = true;
                            status = {status: false, error: "email not found"};
                            res.send(status);
                        }

                        var userName = response.name;
                        var facebookId = response.id;

                        var userData = {
                            name: userName,
                            facebookId: facebookId,
                            facebookData: {
                                accessToken: accessToken
                            }
                        };

                        if (response.email) {
                            userData.email = response.email;
                            userData.facebookData.email = response.email;
                        }

                        if (response.locale) {
                            userData.locale = response.locale;
                            userData.facebookData.locale = response.locale;
                        }

                        if (response.currency && response.currency.user_currency) {
                            userData.facebookData.currency = response.currency.user_currency;
                        }

                        if (response.cover && response.cover.source) {
                            userData.facebookData.coverPhoto = response.cover.source;
                        }

                        if (response.picture && response.picture.data && response.picture.data.url) {
                            userData.facebookData.profilePic = response.picture.data.url;
                        }

                        if (response.age_range) {
                            userData.facebookData.age_range = response.age_range;
                        }

                        if (response.first_name) {
                            userData.facebookData.first_name = response.first_name;
                        }

                        if (response.last_name) {
                            userData.facebookData.last_name = response.last_name;
                        }

                        if (response.gender) {
                            userData.facebookData.gender = response.gender;
                        }

                        var uid = uuid.v1();
                        responseToken = uid;
                        var hash = sha1(uid);
                        var date = new Date();
                        var token = {
                            date: date,
                            hashedToken: hash
                        };

                        var query = {};
                        var options = {};

                        var email, updateQuery;

                        async.parallel({
                                facebookId: function (callback) {
                                    userCollection.findOne({
                                        facebookId: facebookId
                                    }, function (err, userResult) {
                                        if (err) {
                                            return callback(err, null);
                                        }
                                        else {
                                            callback(null, userResult);
                                        }
                                    })
                                },
                                emailAccount: function (callback) {
                                    if (response.email) {
                                        email = response.email.toLowerCase();

                                        userCollection.findOne({email: email}, function (err, userResult) {
                                            if (err) {
                                                return callback(err, null);
                                            }
                                            else {
                                                callback(null, userResult);
                                            }
                                        });
                                    }
                                    else {
                                        callback(null, null);
                                    }
                                }
                            },
                            function (err, results) {
                                if (err) {
                                    console.log("error, async failed");
                                }
                                else {
                                    console.log("Got results");
                                    console.log(results);

                                    /*
                                     if(results.facebookId){
                                     if(results.emailAccount){
                                     //update this emailAccount with FB details.
                                     }
                                     else{
                                     //update this facebookID with all details.
                                     }
                                     }
                                     else{
                                     if(results.emailAccount){
                                     //update this emailAccount with FB details.
                                     }
                                     else{
                                     //add new user with all details.
                                     }
                                     }
                                     */

                                    /**
                                     * F*ck this all done by Find instead of FindOne

                                     console.log("typeof results.emailAccount");
                                     console.log(typeof results.emailAccount);
                                     console.log(Object.keys(results.emailAccount).length === 0);
                                     console.log(typeof results.emailAccount[0] !== 'undefined');
                                     console.log(results.emailAccount[0] !== null);


                                     console.log("typeof results.facebookId");
                                     console.log(typeof results.facebookId);
                                     console.log(Object.keys(results.facebookId).length === 0);
                                     console.log(typeof results.facebookId[0] !== 'undefined');
                                     console.log(results.facebookId[0] !== null);
                                     */

                                    if (results.emailAccount || results.facebookId) {
                                        //update this emailAccount with FB details without source.
                                        if (results.emailAccount) {
                                            query = {'email': email};
                                        }
                                        else {
                                            query = {facebookId: response.id};
                                        }
                                        options = {new: true};
                                        updateQuery = {
                                            $set: {
                                                "facebookData": userData.facebookData,
                                                "facebookId": facebookId
                                            },
                                            $push: {token: token}
                                        };
                                        userCollection.findOneAndUpdate(query, updateQuery, options,
                                            function (err, userResult) {
                                                if (err) {
                                                    status = {status: false, error: err, message: 'database error'};
                                                    if (!responded) {
                                                        res.send(status);
                                                    }
                                                }
                                                else {
                                                    result["status"] = true;
                                                    result["error"] = false;
                                                    result["data"] = {
                                                        token: responseToken,
                                                        user: {
                                                            id: userResult._id,
                                                            email: userResult.email
                                                        }
                                                    };
                                                    result["message"] = 'successfully logged in';
                                                    if (!responded) {
                                                        res.send(result);
                                                    }
                                                    if (results.emailAccount && results.facebookId) {
                                                        if (results.emailAccount._id !== results.facebookId._id) {
                                                            if (query.email) {
                                                                userCollection.remove({facebookId: response.id});
                                                            }
                                                            else {
                                                                //this scenario will never raise, see conditions above
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                    }
                                    else {
                                        //add new user with all details.
                                        var user = userCollection({
                                            "firstName": response.first_name,
                                            "lastName": response.last_name,
                                            "name": response.name,
                                            "email": email,
                                            "gender": response.gender,
                                            "locale": response.locale,
                                            "facebookId": facebookId,
                                            "facebookData": userData.facebookData,
                                            "token": [token]
                                        });
                                        user.save(function (err, userResult) {
                                            if (err) {
                                                status = {status: false, error: err, message: 'database error'};
                                                if (!responded) {
                                                    res.send(status);
                                                }
                                            }
                                            else {
                                                result["status"] = true;
                                                result["error"] = false;
                                                result["data"] = {
                                                    token: responseToken,
                                                    user: {
                                                        id: userResult._id,
                                                        email: userResult.email,
                                                        name: userResult.name
                                                    }
                                                };
                                                result["message"] = 'successfully signed up and logged in';
                                                if (!responded) {
                                                    res.send(result);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                    }
                }
            );
        }
        else {
            status = {status: false, error: "access token missing"};
            res.send(status);
        }
    }
};
