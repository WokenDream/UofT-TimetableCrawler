var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CourseDescriptionSchema = new Schema({
    crsCode: {type: String, required: true},
    crsName: {type: String, required: true},
    crsDescription: {type: String, required: true},
    prerequisite: {type: String, default: 'None'}
});

module.exports = mongoose.model('CourseDescription', CourseDescriptionSchema);