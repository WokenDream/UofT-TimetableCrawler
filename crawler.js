var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/27017');
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.on('connected', () => console.log('database connected'));

var course = require('./models/course');
var lecSection = require('./models/lecture');
var section = require('./models/section').SectionSchema;
var session = require('./models/session');

var courseInfo = new Map();

crawl();

function crawl() {
    crawlEngineeringCourseDescription();
    // crawlEngineeringTimetables();
    // crawlArtsSciTimetables();
}

function crawlEngineeringCourseDescription() {
    let page = "https://portal.engineering.utoronto.ca/sites/calendars/current/Course_Descriptions.html";
    request(page, function (error, res, body) {
        if (error) {
            console.log('crawling engineering course decription failed');
            console.log(error);
        }
        console.log("status code: " + res.statusCode);

        if (res.statusCode !== 200) {
            return;
        }

        let $ = cheerio.load(body);
        console.log('crawling ' + page);
        gatherEngineeringCourseDescription($);
    });
}

function crawlArtsSciTimetables() {
    console.log('stay tunned for ArtSci');
}

function crawlEngineeringTimetables() {

    let pages = [
        "https://portal.engineering.utoronto.ca/sites/timetable/winter.html",
        "https://portal.engineering.utoronto.ca/sites/timetable/fall.html"
    ];

    for (let page of pages) {
        console.log('adding ' + page + ' to queue');
        request(page, function (error, res, body) {
            if (error) {
                console.log(error);
            }

            console.log("status code: " + res.statusCode);

            if (res.statusCode !== 200) {
                return;
            }
            let $ = cheerio.load(body);
            console.log('crawling ' + page);
            gatherEngineeringCourseTime($);
        });
    }
}

function gatherEngineeringCourseTime($) {
    let disiplines = ['AER', 'APM', 'APS', 'BME', 'CHE', 'CIV', 'CME', 'CSC',
        'ECE', 'ESC', 'FOR', 'JRE', 'MAT', 'MIE', 'MIN', 'MSE', 'PHY', 'ROB'
    ];

    for (let disipline of disiplines) {
        let timetables = $('a[name=' + disipline + ']');
        let prevCrsCode = '';
        $('tr', timetables).slice(1).each(function () {
            let section = $('td', this);
            prevCrsCode = dbInsert(section, prevCrsCode);
        });

    }
}

function gatherEngineeringCourseDescription($) {
    // let courses = $('a[name]a:not([name^=Course])');
    let courses = $("a[name$=H1],a[name$=Y1]");
    let i = 0;
    courses.each(function() {
        let crsCode = $(this).attr('name');
        let crsName = $(this).next().find('span').eq(1).text();
        courseInfo.set(crsCode, crsName);
    });

    for (let [key, val] of courseInfo) {
        console.log();
        console.log(key);
        console.log(val);
    }
}

function dbInsert(section, prevCrsCode) {
    let crsCode = section.eq(0).text().slice(0, -1);
    let secCode = section.eq(1).text();
    let dayOfWeek = section.eq(3).text();
    let start = section.eq(4).text();
    let finish = section.eq(5).text();
    let location = section.eq(6).text().trim();
    let instructor = section.eq(7).text().trim();

    if (prevCrsCode === crsCode) {
        console.log(secCode);
        console.log(dayOfWeek);
        console.log(start);
        console.log(finish);
        if (location !== '') {
            console.log(location);
        }
        if (instructor !== '') {
            console.log(instructor);
        }
    } else {
        console.log();
        console.log(crsCode);
        console.log(secCode);
        console.log(dayOfWeek);
        console.log(start);
        console.log(finish);
        if (location !== '') {
            console.log(location);
        }
        if (instructor !== '') {
            console.log(instructor);
        }
    }
    return crsCode;
}