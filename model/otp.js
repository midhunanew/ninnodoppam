/**
 * Created by mithoos on 24/3/16.
 */
var mongoose = require('mongoose'),
    validate = require('mongoose-validator');
var Schema = mongoose.Schema;

var states = 'created hashed send verified expired deleted'.split(' ');

var otpSchema = new Schema({
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
        validate: [
            validate({
                validator: 'isEmail'/*,
                 message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'*/
            })
        ]
    },
    secret: {
        type: String,
        unique: true,
        required: true
    },
    status: {type: String, enum: states, default: "created"},
    date: {
        type: Date,
        default: Date.now
    },
    type: {type: String, enum: ['phone', 'email'], required: true},
    hash: {
        type: String,
        required: false
    },
    userId: {
        type: String,
        required: false,
        ref: 'user'
    }
});

otpSchema.pre('save', function (next) {
    if (this.phone || this.email) {
        next();
    }
    else {
        next(Error('Either phone or email required'));
    }
});

var otp = mongoose.model('otp', otpSchema);
module.exports = otp;
module.exports.otpSchema = otpSchema;
