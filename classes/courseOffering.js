function CourseOffering(crsName) {
    this.crsName = crsName || 'Unofficial Course';
    this.lectures = new Map(); // [key: secCode, value: array of lec sessions]
    this.tutorials = new Map(); // [key: secCode, value: array of sessions]
    this.practicals = new Map(); // [key: secCode, value: array of sessions]
}
CourseOffering.prototype.printSelf = function() {
    console.log(this.crsName);
    for (let [lecCode, lecSessions] of this.lectures) {
        console.log(lecCode);
        for (let session of lecSessions) {
            session.printSelf();
        }
    }
}

/**
 * covert CourseOffering to JSON compatible objects
 */
CourseOffering.prototype.toObject = function() {
    let offering = new Object();
    offering.crsName = this.crsName;
    offering.lectures = new Object();
    offering.tutorials = new Object();
    offering.practicals = new Object();
    for (let [secCode, sessions] of this.lectures) {
        offering.lectures[secCode] = sessions;
    }
    for (let [secCode, sessions] of this.tutorials) {
        offering.tutorials[secCode] = sessions;
    }
    for (let [secCode, sessions] of this.practicals) {
        offering.practicals[secCode] = sessions;
    }
    return offering;
}

function Session(dayOfWeek, startTime, endTime, location, instructors) {
    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location || 'TBA';
    this.instructors = instructors || 'TBA'
}
Session.prototype.printSelf = function() {
    console.log(this.dayOfWeek);
    console.log(this.startTime);
    console.log(this.endTime);
    console.log(this.location);
    console.log(this.instructors);
}

module.exports = {
    CourseOffering: CourseOffering,
    Session: Session
}