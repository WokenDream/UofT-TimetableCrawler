var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

function gatherCourseInfo($) {
    let disiplines = ['AER', 'APM', 'APS', 'BME', 'CHE', 'CIV', 'CME', 'CSC',
        'ECE', 'ESC', 'FOR', 'JRE', 'MAT', 'MIE', 'MIN', 'MSE', 'PHY', 'ROB'
    ];

    for (let disipline of disiplines) {
        let timetables = $('a[name=' + disipline + ']').first();
        $('tr', timetables).slice(1).each( function() {
            $('td', this).each( function() {
                console.log($(this).text());
            });
        });

    }
}

function crawlEngineeringPages() {

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
            gatherCourseInfo($);
        });
    }
}

function crwalArtsSciPages() {
    console.log('stay tunned for ArtSci');
}

function crawl() {
    crawlEngineeringPages();
    crwalArtsSciPages();
}

crawl();