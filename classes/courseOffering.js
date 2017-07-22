function CourseOffering(crsName) {
    this.crsName = crsName || 'Unofficial Course of the Program';
    this.lectures = [];
    this.tutorials = [];
    this.practicals = [];
}
CourseOffering.prototype.printSelf = function() {
    console.log(this.crsName);
    for (let lec of this.lectures) {
        console.log(lec.instructor);
        console.log(lec.secCode);
        console.log(lec.dayOfWeek);
        console.log(lec.startTime);
        console.log(lec.endTime);
        console.log(lec.location);
    }
}

// function Section(secCode) {
//     this.secCode = secCode;
//     this.sessions = [];
// }

// function LecSection(secCode, instructor) {
//     Section.call(this, secCode);
//     this.instructor = instructor || 'TBA';
//     //just for storing data, no need to inherit prototype chain
// }

function Session(secCode, dayOfWeek, startTime, endTime, location) {
    this.secCode = secCode;
    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location || 'TBA';
}

function LecSession(instructor, secCode, dayOfWeek, startTime, endTime, location) {
    Session.call(this, secCode, dayOfWeek, startTime, endTime, location);
    this.instructor = instructor || 'TBA';
}

module.exports = {
    CourseOffering: CourseOffering,
    // Section: Section,
    // LecSection: LecSection,
    Session: Session,
    LecSession: LecSession
}