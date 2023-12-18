import fs from "fs";
import {Day} from "./Course.js";

const CruBuilder = function() {
    this.name = '';
}

CruBuilder.prototype.build = function (cruParser, ues) {
    let time = performance.now();
    let result = "SCHEDULE.CRU - Emploi du temps\r\n";
    result += "Emploi du temps avec différentes salles au format cru\r\n"
    result += "+UVUV\r\n";
    result += "Seance 1 S=1 / Seance 2 S=3\r\n" +
        "Seance 1 S=2 / Seance2 S=4\r\n";
    let schedule = cruParser.schedule.ues.filter(v => ues.includes(v.name))
    for (let ue of schedule) {
        result += this.ue(ue);
    }
    time = performance.now() - time;
    result += "Page générée en : " + time +" sec";
    fs.writeFileSync('schedule.cru', result);
    return true;
}

CruBuilder.prototype.ue = function (ue) {
    let result = "+"+ ue.name +"\r\n";
    for (let course of ue.courses){
        result += this.course(course);
    }
    return result;
}

CruBuilder.prototype.course = function (course){
    let result = course.nbCourse + ",";
    result += course.type + ",";
    result += "P=" + course.headcount + ",";
    result += "H=" + Object.keys(Day).find(v => Day[v] === course.day) + " ";
    result += this.getFormatDate(course.start) + "-"
    result += this.getFormatDate(course.end) + ",";
    result += course.group + ",";
    result += "S=" + course.classrooms;
    return result + "//\r\n";
}

CruBuilder.prototype.getFormatDate = function(ts){
    let date = new Date(ts);
    return date.getHours() + ":" + date.getMinutes().toString().padStart(2, '0');
}

export default CruBuilder;