import {Day} from "./Course.js";
import ICalendarBuilder from "./ICalendarBuilder.js";

const Schedule = function() {
    this.ues = [];
    this.title = '';
    this.description = '';
    this.filename = '';
    this.exemple = '';
    this.format = '';
    this.classrooms = new Set;
    this.courses = [];
}

Schedule.prototype.addUE = function (ue) {
    this.ues.push(ue);
}

Schedule.prototype.removeUE = function (name) {
    this.ues = this.ues.filter(ue => ue.name !== name)
}

Schedule.prototype.getScheduleByDay = function (day, ues = []) {
    return this.ues
        .map(value => value.courses)
        .reduce((previousValue, currentValue) => {
            return previousValue.concat(currentValue)
        }, [])
        .filter(value => ues.length > 0? (value.day === Day[day] && ues.includes(value.name)) : (value.day === Day[day]))
        .sort((a,b) => a.start - b.start);
}

Schedule.prototype.getSchedule = function (ues = []) {
    let scheduleWeek = {};
    for (const key of Object.keys(Day)) {
        if (ues.length > 0){
            scheduleWeek[key] = this.getScheduleByDay(key, ues)
        } else {
            scheduleWeek[key] = this.getScheduleByDay(key)
        }
    }
    return scheduleWeek;
}


Schedule.prototype.getScheduleByClassroomAndTimes = function(classroom, times, day){
    return this.ues
        .map(value => value.courses)
        .reduce((previousValue, currentValue) => {
            return previousValue.concat(currentValue)
        }, [])
        .filter(value => value.classrooms === classroom && value.day === Day[day] &&
            ((times[0] >= value.start && times[0] <= value.end) ||
                (times[1] >= value.start && times[1] <= value.end))
        );
}

Schedule.prototype.getFreeClassroomsByTimes = function (times) {
    let freeClassroomPerDay = {};
    for (let day in this.getSchedule()){
        let freeClassroom = [];
        for (let classroom of this.classrooms){
            if (this.getScheduleByClassroomAndTimes(classroom, times, day).length === 0 ){
                freeClassroom.push(classroom);
            }
        }
        freeClassroom.sort()
        freeClassroomPerDay[day] = freeClassroom;
    }
    return freeClassroomPerDay;
}

Schedule.prototype.displayConsoleFreeClassroom = function (logger, times) {
    let schedule = this.getFreeClassroomsByTimes(times)
    for (let day in schedule){
        logger.info(Day[day] + " : ");
        logger.info("Les salles libres sont : "+ schedule[day] +" pour ce créneau")
    }
}


Schedule.prototype.createVisualisation = function(ues = [], start = false, end = false) {
    let icalendar = new ICalendarBuilder();
    icalendar.buildCalendarFromSchedule(this.getSchedule(ues), start, end);
}

Schedule.prototype.displayConsole = function(logger, ues = []) {
    let schedule = this.getSchedule(ues);
    for (let day in schedule) {
        if (schedule[day].length > 0) {
            logger.info(Day[day] + ' : ');
            for (let course of schedule[day]) {
                logger.info("De " + this.getFormatDate(course.start) + " à " + this.getFormatDate(course.end) + " : " +
                    course.name + " | " + course.type + " | " + course.group + " en " + course.classrooms );
            }
        } else {
            logger.info("Aucun cours le " + Day[day]);
        }

    }
}

Schedule.prototype.getFormatDate = function (ts) {
    const date = new Date(ts);
    return date.getHours().toString().padStart(2, '0') + "h" +  date.getMinutes().toString().padStart(2, '0');
}


Schedule.prototype.getOccupationRates = function(classrooms, boundaryStart = 8, boundaryEnd = 20) {
    let boundary = (boundaryEnd - boundaryStart) * 6;
    console.log(boundary);
    let occupationByClassroom = {};
    for (let classroom of classrooms){
        let occupation = this.ues
            .map(value => value.courses)
            .reduce((previousValue, currentValue) => {
                return previousValue.concat(currentValue)
            }, [])
            .filter(value => value.classrooms === classroom)
            .reduce((acc, value) => acc + (new Date(value.end)).getHours() - (new Date(value.start)).getHours(), 0)
        ;
        occupationByClassroom[classroom] = Math.round(occupation / boundary * 10000)/100;
    }
    return occupationByClassroom;
}

Schedule.prototype.sortClassroomByHeadcount = function () {
    let headcountByClassroom = [];
    for (let classroom of this.classrooms){
        let headcount = Math.max(...this.ues
            .map(value => value.courses)
            .reduce((previousValue, currentValue) => {
                return previousValue.concat(currentValue)
            }, [])
            .filter(value => value.classrooms === classroom)
            .map(value => Number(value.headcount)))
        ;
        headcountByClassroom.push([classroom, headcount]);
    }
    return headcountByClassroom.sort((a,b) => b[1] - a[1]);
}

export default Schedule;