var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/27017');
// var connection = mongoose.connection;
// connection.on('error', console.error.bind(console, 'connection error:'));
// connection.on('connected', () => console.log('database connected'));

var course = require('./models/course');
var lecSection = require('./models/lecture');
var section = require('./models/section').SectionSchema;
var session = require('./models/session');

var crawlEngineeringTimetables = require('./engineeringCrawler');

crawl();

function crawl() {
    let engResults = crawlEngineeringTimetables();
    engResults.then(function(timetables) {
        console.log(timetables.winter);
    });
}

// function crawlArtsSciTimetables() {
//     console.log('stay tunned for ArtSci');
// }