var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sectionModule = require('./section');

var LectureSchema = sectionModule.SectionSchema(
    'Lecture',
    new Schema(
        {
            instructors: [{ type: String, default: 'TBA' }]
        },
        sectionModule.options
    )
);