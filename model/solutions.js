var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var states = 'received modified approved deleted'.split(' ');

var solutionSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    complaintId: {type: String, required: false, ref: 'complaint'},
    status: {type: String, enum: states, default: "received"}
});

var solution = mongoose.model('solution', solutionSchema);
module.exports = solution;
module.exports.solutionSchema = solutionSchema;