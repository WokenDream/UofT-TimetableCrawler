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

var courseNames = new Map();
var timeTable = null; //this will points to either fall or winter course info
var timeTableFall = new Map();
var timeTableWinter = new Map();

function CourseOffering(crsName) {
    this.crsName = crsName || 'Unofficial Course of the Program';
    this.lectures = [];
    this.tutorials = [];
    this.practicals = [];
}

function Section(secCode) {
    this.secCode = secCode;
    this.sessions = []
}

function LecSection(secCode, instructor) {
    Section.call(this, secCode);
    this.instructor = instructor || 'TBA';
    //just for storing data, no need to inherit prototype chain
}

function Sesssion(dayOfWeek, startTime, endTime, location) {
    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location || 'TBA';
}

crawl();

function crawl() {
    crawlEngineering();
    // crawlEngineeringTimetables();
    // crawlArtsSciTimetables();
}


function crawlEngineering() {
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

function gatherEngineeringCourseDescription($) {
    // let courses = $('a[name]a:not([name^=Course])');
    let courses = $("a[name$=H1],a[name$=Y1]");
    let i = 0;
    courses.each(function () {
        let crsCode = $(this).attr('name');
        let crsName = $(this).next().find('span').eq(1).text();
        courseNames.set(crsCode, crsName);
    });

    crawlEngineeringTimetables();
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
            if (page.indexOf('winter') > 0) {
                timeTable = timeTableWinter;
            } else if (page.indexOf('fall') > 0) {
                timeTable = timeTableFall;
            } else {
                console.log('This should not print');
            }
            gatherEngineeringCourseTime($);

            // if (page.indexOf('fall') > 0) {
            //     for (let [crsCode, offering] of timeTableFall) {
            //         console.log(crsCode);
            //     }
            // }
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

function dbInsert(section, prevCrsCode) {
    let crsCode = section.eq(0).text().slice(0, -1);
    let secCode = section.eq(1).text();
    let dayOfWeek = section.eq(3).text();
    let start = section.eq(4).text();
    let finish = section.eq(5).text();
    let location = section.eq(6).text().trim();
    let instructor = section.eq(7).text().trim();

    let crsName = courseNames.get(crsCode);
    let session = new Sesssion(dayOfWeek, start, finish, location);

    if (crsName === undefined) {
        //first time encounter an unofficial course
        console.log('unofficial course ' + crsCode);
        courseNames.set(crsCode, '');
    }
    let offering = timeTable.get(crsCode);
    if (offering === undefined){
        //first time encounter this offering
        offering = new CourseOffering(crsName);
        timeTable.set(crsCode, offering);
    }


    if (secCode.startsWith('LEC')) {
        let lecSection = new LecSection(secCode, instructor);
        lecSection.sessions.push(session);
        offering.lectures.push(lecSection);
    } else if (secCode.startsWith('TUT')) {
        let section = new Section(secCode);
        section.sessions.push(section);
        offering.tutorials.push(section);
    } else if (secCode.startsWith('PRA')) {
        let section = new Section(secCode);
        section.sessions.push(section);
        offering.practicals.push(section);
    } else {
        console.log('this should not happen');
        console.log(crsCode + " " + secCode);
    }

    return crsCode;
}
