var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var states = 'received viewed assigned unavailable completed deleted'.split(' ');

var complaintSchema = new Schema({
    _id: {
        type: Number,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    identification: {
        type: String,
        required: true
    },
    district: {
        type: Number,
        min: 1,
        max: 14
    },
    assembly: {
        type: Number,
        min: 1,
        max: 140
    },
    history: [
        {
            event: {type: String, enum: states, default: "received"},
            eventNative:{type: String, required: true,default:"പരാതി സമർപ്പിച്ചു."},
            date: {type: Date, default: Date.now},
            author: {type: String, required: true, ref: 'Volunteer'},
            authorNative: {type: String, required: true, default: 'പരാതിക്കാരൻ'}
        }
    ],
    status: {type: String, enum: ["active", "done"], default: "active"}
});

var complaint = mongoose.model('complaint', complaintSchema);
module.exports = complaint;
module.exports.complaintSchema = complaintSchema;