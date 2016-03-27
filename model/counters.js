var mongoose = require('mongoose');
//var validate = require('mongoose-validator');
var Schema = mongoose.Schema;

var states = 'received viewed assigned unavailable completed deleted'.split(' ');

var countersSchema = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    "seq": {
        type: Number,
        default: 0
    }
});
countersSchema.index({_id: 1, seq: 1}, {unique: true});
var Counters = mongoose.model('counters', countersSchema);
module.exports = Counters;
module.exports.countersSchema = countersSchema;