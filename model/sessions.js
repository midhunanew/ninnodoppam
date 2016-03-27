/**
 * Created by toobler on 4/1/16.
 */
/* The following lines include jsHint overrides */
/*jshint strict:false */
/*global require, module */
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
var sessionSchema = new Schema({
    _id:{type:String},
    secret: {type: String, required: true},
    key: {type: String, required: true},
    token: [
        {
            "hashedToken": {type: String, unique: true, required: false},
            "date": {type: Date, default: Date.now}
        }
    ],
    status: {type: Boolean, required: true},
    platformId: {type: String, required: true},
    ownerId: {type: String, required: true},
    platform: {type: String, required: true},
    comment: {type: String, required: true},
    platform_delay: {type: String, required: true}
});
sessionSchema.index({platformId: 1, ownerId: 1}, {unique: true});
var Session = mongoose.model('sessions', sessionSchema);
module.exports = Session;
module.exports.sessionSchema = sessionSchema;