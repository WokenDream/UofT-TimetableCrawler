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

// crawl();

/**
 * crawl engineering and artsci timetables and return the result as a JSON object
 */
function crawl() {
    console.log('crawler initiated...');
    let engResults = crawlEngineeringTimetables();
    // engResults.then(function(timetables) {
    //     // console.log(timetables.fall);

    //     // for (let [crsCode, crsOffering] of timetables.fall) {
    //     //     console.log();
    //     //     console.log(crsCode);
    //     //     crsOffering.printSelf();
    //     // }
    // });
    return new Promise(function(resolve, reject) {
        engResults.then(function(timetables) {

            resolve(timetablesToJSON(timetables));
        });
    });
}

/**
 * converts timetables: object of maps of (objects containing) maps of arrays of objects
 * to json compatible representation: object of objects of (objects containing) objects of arrays of objects
 * @param {*} timetables 
 */
function timetablesToJSON(timetables) {
    let jsonTimetableFall = new Object();
        for (let [crsCode, crsOffering] of timetables.fall) {
            jsonTimetableFall[crsCode] = crsOffering.toObject();
        }

        let jsonTimetableWinter = new Object();
        for (let [crsCode, crsOffering] of timetables.winter) {
            jsonTimetableWinter[crsCode] = crsOffering.toObject();
        }

        let jsonTimetables =  {
            fall: jsonTimetableFall,
            winter: jsonTimetableWinter
        };

        return JSON.stringify(jsonTimetables);
}

module.exports = {
    crawl: crawl
}

// function crawlArtsSciTimetables() {
//     console.log('stay tunned for ArtSci');
// }