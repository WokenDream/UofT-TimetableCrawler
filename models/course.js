var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CourseSchema = new Schema({
    crsCode: {type: String, required: true, maxlength: 10},
    crsName: {type: String, required: true},
    lectures: [{type: Schema.ObjectId, ref: 'LecSection'}],
    tutorials: [{type: Schema.ObjectId, ref: 'Section'}],
    practicals: [{type: Schema.ObjectId, ref: 'Section'}]
});

module.exports = mongoose.model('Course', CourseSchema);