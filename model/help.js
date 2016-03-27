var mongoose = require('mongoose');
//var validate = require('mongoose-validator');
var Schema = mongoose.Schema;

var states = 'received viewed assigned unavailable completed deleted'.split(' ');

var helpSchema = new Schema({
    phone: {
        type: Number,
        required: true,
        min: 5123456789,
        max: 9999999999
    },
    date: {
        type: Date,
        default: Date.now
    },
    history: [
        {
            event: {type: String, enum: states, default: "received"},
            "date": {type: Date, default: Date.now},
            author: {type: String, required: true, ref: 'Volunteer'}
        }
    ],
    status: {type: String, enum: ["active", "done"], default: "active"}
    /*    userEmail: {
     type: String, required: true, unique:true, validate: validate({
     validator: 'isEmail',
     message: 'Sender Email should be valid'
     })
     }*/
});
//helpSchema.index({platformId: 1, ownerId: 1}, {unique: true});
var Help = mongoose.model('help', helpSchema);
module.exports = Help;
module.exports.helpSchema = helpSchema;