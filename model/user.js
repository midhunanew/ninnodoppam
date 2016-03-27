/* The following lines include jsHint overrides */
/*jshint strict:false */
/*global require, module */
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
var userSchema = new Schema({
        "firstName": {
            type: String,
            required: false
        },
        "lastName": {
            type: String,
            required: false
        },
        "name": {
            type: String,
            required: false
        },
        "gender": {
            type: String,
            required: false
        },
        "locale": {
            type: String,
            required: false
        },
        facebookId: {
            type: String,
            required: false
        },
        facebookData: {
            type: Object, // Mixed
            required: false
        },
        phone: {
            type: Number,
            required: false,
            min: 5123456789,
            max: 9999999999
        },
        email: {
            type: String,
            required: false,
            lowercase: true,
            trim: true,
            unique: true,
            validate: [
                validate({
                    validator: 'isEmail',
                    message: 'Email should be valid'
                })
            ]
        },
        token: [
            {
                "hashedToken": {type: String, unique: true, required: false},
                "date": {type: Date, default: Date.now}
            }
        ],
        status: {type: Boolean, default: true},
        date_joined: {
            type: Date,
            default: Date.now
        }
    }),
    User = mongoose.model('users', userSchema);
module.exports = User;
module.exports.userSchema = userSchema;