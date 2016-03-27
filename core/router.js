
var path = require('path');
var cwd = path.join(__dirname, "../");
var sha1 = require('sha1');//create hash of token
//var sessionModel = cwd + 'model/sessions';
//var sessionCollection = require(sessionModel);
//var userModel = cwd + 'model/user';
//var userCollection = require(userModel);

exports.route = function (app) {

    app.use(function (req, res, next) {
        var debugMessages = [];
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200)
        }
        console.log(req.path);
        debugMessages.push("create token based authentication");
        console.log("req.headers.accesstoken");
        console.log(req.headers.accesstoken);
        next();
        /*if (req.session.userId) {
            next();
        }*/
        /*else {*/
            //ignoring authentication checking for following routes.
            /*if (
                req.path === '/' ||
                req.path === '/help'
                ) {
                debugMessages.push("path added as an exception");
                next();
            }
            else {
                var Token = req.path.split("/")[4];
                var apiToken = req.body.accessToken || Token;
                var token = req.headers.accesstoken || apiToken;
                if (token) {
                    var hashedToken = sha1(token);
                    sessionCollection.findOne({
                        "token.hashedToken": hashedToken
                    }, function (err, doc) {
                        if(err){
                            console.log("Internal server error");
                            res.status(401).json({status: false, message: 'session not found'});
                        }
                        if (doc && doc.ownerId) {
                            //console.log("session");
                            //console.log(doc);
                            userCollection.findOne({_id:doc.ownerId},function(err,userDoc){
                                if(err){
                                    console.log("Internal server error");
                                    res.status(401).json({status: false, message: 'session not found'});
                                }
                                else{
                                    if(userDoc) {
                                        //console.log("userDoc");
                                        //console.log(userDoc);
                                        res.currentMobileAppUser = userDoc;
                                        res.currentMobileAppUser.platformId = doc.platformId;
                                        res.currentMobileAppUser.session = doc;
                                        console.log("res.currentMobileAppUser.platformId", res.currentMobileAppUser.platformId);
                                        next();
                                    }
                                    else{
                                        console.log("Internal server error");
                                        res.status(401).json({status: false, message: 'user not found'});
                                    }
                                }
                            });
                        } else {
                            console.log("session not found");
                            res.status(401).json({status: false, message: 'session not found'});
                        }
                    })
                } else {
                    debugMessages.push("token not found anywhere");
                    res.status(401).json({status: false, message: 'token not found'});
                }
            }*/
        /*}*/
        console.log(debugMessages.join("\n"));
    });

}
