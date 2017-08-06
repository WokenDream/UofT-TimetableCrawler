var request = require('request');
var cheerio = require('cheerio');

var courseOffering = require('./classes/courseOffering');
var CourseOffering = courseOffering.CourseOffering;
var Session = courseOffering.Session;
var LecSession = courseOffering.LecSession;

/**
 * returns a promise containing two maps [key: course code, value: course name]
 */
function crawl() {
    let crawler = new Promise(crawlerInit);
    let timetables = crawlEngineeringTimetables(crawler);
    return Promise.all(timetables).then((values) => {
        return {
            winter: values[0],
            fall: values[1]
        };
    });
}

/**
 * Initialize cralwer by pairing course codes with names
 * returns a map [key: course code, value: course name]
 * @param {*} resolve 
 * @param {*} reject 
 */
function crawlerInit(resolve, reject) {
    let page = "https://portal.engineering.utoronto.ca/sites/calendars/current/Course_Descriptions.html";
    request(page, function (error, res, body) {
        if (error) {
            reject(error);
        }
        if (res.statusCode !== 200) {
            reject(res.statusCode);
        }

        let $ = cheerio.load(body);
        console.log('crawling ' + page);
        let courseNames = gatherEngineeringCourseDescription($);
        resolve(courseNames);
    });
}

/**
 * 
 * @param {*} $ DOM manipulator
 * @param {*} courseNames a map [key: course code, value: course name]
 */
function gatherEngineeringCourseDescription($) {
    let courseNames = new Map();
    let courses = $("a[name$=H1],a[name$=Y1]");
    courses.each(function () {
        let crsCode = $(this).attr('name');
        let crsName = $(this).next().find('span').eq(1).text();
        courseNames.set(crsCode, crsName);
    });
    return courseNames;
}

/**
 * crawls the fall and winter timetables
 * return an array of promises that resolve the timetable info
 * @param {*} crawler a promise
 */
function crawlEngineeringTimetables(crawler) {
    let timetables = [];
    let pages = [
        "https://portal.engineering.utoronto.ca/sites/timetable/winter.html",
        "https://portal.engineering.utoronto.ca/sites/timetable/fall.html"
    ];
    for (let page of pages) {
        let timetable = crawler.then(function (courseNames) {
            return crawlSinglePage(page, courseNames);
        });
        timetables.push(timetable);
    }
    return timetables;
}

/**
 * crawls a single page
 * @param {*} page page to be crawled
 * @param {*} courseNames a map [key: course code, value: course name]
 */
function crawlSinglePage(page, courseNames) {
    return new Promise(function (resolve, reject) {
        request(page, function (error, res, body) {
            if (error) {
                reject(error);
            }
            if (res.statusCode !== 200) {
                reject('status code' + res.statusCode);
            }
            let $ = cheerio.load(body);
            console.log('crawling ' + page);
            let timetable = gatherEngineeringCourseTime($, courseNames);
            resolve(timetable);
        });
    });
}

/**
 * return a map [key: course code, value: course offering info]
 * by crawling timetable using the given DOM manipulator
 * @param {*} $ DOM manipulator
 * @param {*} courseNames a map [key: course code, value: course name]
 */
function gatherEngineeringCourseTime($, courseNames) {
    let disiplines = [
        'AER', 'APM', 'APS', 'BME', 'CHE', 'CIV', 'CME', 'CSC',
        'ECE', 'ESC', 'FOR', 'HPS', 'JRE', 'MAT', 'MIE', 'MIN', 
        'MSE', 'PHY', 'ROB', 'STA'
    ];
    let timetable = new Map();
    for (let disipline of disiplines) {
        let offerings = $('a[name=' + disipline + ']');
        $('tr', offerings).slice(1).each(function () {
            let section = $('td', this);
            updateTimetable(timetable, section, courseNames);
        });
    }
    return timetable;
}

/**
 * insert a section into timetable
 * @param {*} timetable the timetable to be updated
 * @param {*} section a section to be read
 * @param {*} courseNames a map [key: course code, value: course name]
 */
function updateTimetable(timetable, section, courseNames) {
    let crsCode = section.eq(0).text().slice(0, -1);
    let secCode = section.eq(1).text();
    let dayOfWeek = section.eq(3).text();
    let start = section.eq(4).text();
    let finish = section.eq(5).text();
    let location = section.eq(6).text().trim();
    let instructor = section.eq(7).text().trim();

    let crsName = courseNames.get(crsCode);
    if (crsName === undefined) {
        //first time encounter an unofficial course
        console.log('unofficial course ' + crsCode);
        courseNames.set(crsCode, '');
    }
    let offering = timetable.get(crsCode);
    if (offering === undefined) {
        //first time encounter this offering
        offering = new CourseOffering(crsName);
        timetable.set(crsCode, offering);
    }
    
    let category = secCode.slice(0, 3);
    if (category === 'LEC') {
        let lecSession = new LecSession(instructor, dayOfWeek, start, finish, location);
        let lecSessions = offering.lectures.get(secCode);
        if (lecSessions === undefined) {
            lecSessions = [lecSession];
            offering.lectures.set(secCode, lecSessions);
        } else {
            lecSessions.push(lecSession);
        }
    } else if (category === 'TUT') {
        let session = new Session(dayOfWeek, start, finish, location);
        let tutSessions = offering.tutorials.get(secCode);
        if (tutSessions === undefined) {
            tutSessions = [session];
            offering.tutorials.set(secCode, tutSessions);
        } else {
            tutSessions.push(session);
        }
    } else {
        let session = new Session(dayOfWeek, start, finish, location);
        let praSessions = offering.practicals.get(secCode);
        if (praSessions === undefined) {
            praSessions = [session];
            offering.practicals.set(secCode, praSessions);
        } else {
            praSessions.push(session);
        }
    }
}

module.exports = crawl;