const Course = function() {
    this.type = "";
    this.headcount = "";
    this.classrooms = "";
    this.nbCourse = 0;
    this.day = Day.L;
    this.start = 0;
    this.end = 0;
    this.group = "";
    this.name = "";
}

export const Day = {
    L: "Lundi",
    MA: "Mardi",
    ME: "Mercredi",
    J: "Jeudi",
    V: "Vendredi",
    S: "Samedi",
    D: "Dimanche"
}

Object.freeze(Day);

export default Course;
