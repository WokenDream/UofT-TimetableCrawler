var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sectionModule = require('./section');

var LectureSchema = new Schema(
    {
        instructors: [{ type: String, default: 'TBA' }]
    },
    sectionModule.options
);

module.exports = sectionModule.SectionSchema.discriminator('LecSection', LectureSchema);