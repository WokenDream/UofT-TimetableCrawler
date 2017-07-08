var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    dayOfWeek: {type: String, required: true, maxlength: 3},
    startTime: {type: Date, required: true},
    endTime: {type: Date, required: true},
    location: {type: String}
});

module.exports = mongoose.model('Session', SessionSchema);