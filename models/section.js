var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var options = {discriminatorKey: 'sectionType'};
var SectionSchema = new Schema(
    {
        secCode: { type: String, required: true, maxlength: 10 },
        sessions: [{ type: Schema.ObjectId, ref: 'Session' }]
    },
    options
);

module.exports.SectionSchema = mongoose.model('Section', SectionSchema);
module.exports.options = options;