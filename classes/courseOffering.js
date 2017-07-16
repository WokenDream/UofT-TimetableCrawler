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

function Session(dayOfWeek, startTime, endTime, location) {
    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location || 'TBA';
}

module.exports = {
    CourseOffering: CourseOffering,
    Section: Section,
    LecSection: LecSection,
    Session: Session
}