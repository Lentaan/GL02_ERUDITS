import { v4 as uuidv6 } from 'uuid';
import fs from "fs";

const ICalendarDay = {
    D: "SU",
    L: "MO",
    MA: "TU",
    ME: "WE",
    J: "TH",
    V: "FR",
    S: "SA"
}

const ICalendarBuilder = function () {
    this.header = "BEGIN:VCALENDAR\r\n" +
        "VERSION:2.0\r\n" +
        "PRODID:-//University of Sealand//Orus Weekly Schedule 1.0//EN\r\n" +
        "CALSCALE:GREGORIAN\r\n" +
        "METHOD:PUBLISH\r\n"
    this.footer = "END:VCALENDAR\r\n";
    this.headerEvent = "BEGIN:VEVENT\r\n" +
        "TRANSP:TRANSPARENT\r\n";
    this.footerEvent = "END:VEVENT\r\n"
    this.ruleEvent = "RRULE:FREQ=WEEKLY;INTERVAL=1;";
}

ICalendarBuilder.prototype.generateLocation = function (location) {
    return "LOCATION:" + location + "\r\n";
}

ICalendarBuilder.prototype.generateFrequency = function (day, end = false) {
    let result = this.ruleEvent + "BYDAY=" + ICalendarDay[day];
    return  end !== false ? result + ";UNTIL="+ end.replaceAll("-", '') + "T000000\r\n" : result  + "\r\n";
}

ICalendarBuilder.prototype.generateUID = function () {
    return "UID:" + uuidv6() + "\r\n";
}

ICalendarBuilder.prototype.generateSummary = function (summary) {
    return "SUMMARY:" + summary + "\r\n";
}

ICalendarBuilder.prototype.generateStatus = function () {
    return "STATUS:CONFIRMED\r\n";
}

ICalendarBuilder.prototype.generateBusy = function (busy) {
    return "TRANSP:" + busy + "\r\n";
}

ICalendarBuilder.prototype.generateDateFromCourse = function (day, timestamp, inputDate = false) {
    let date;
    if (inputDate !== false) {
        date = new Date(inputDate)
    } else {
        date = new Date(Date.now());
    }
    let time = new Date(timestamp)
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes())
    return this.generateDateFormat(date);
}

/**
 * @param date Date
 * @param hasTime bool
 * @return string
 */
ICalendarBuilder.prototype.generateDateFormat = function (date, hasTime = true) {
    let time = '';
    if (hasTime){
        time = "T"
            + date.getHours().toString().padStart(2, "0")
            + date.getMinutes().toString().padStart(2, "0")
            + date.getSeconds().toString().padStart(2, "0")
    }
    return date.getFullYear() + date.getMonth().toString().padStart(2, "0") + date.getDate().toString().padStart(2, "0") + time;
}

ICalendarBuilder.prototype.generateDTStart = function (date) {
    return "DTSTART:" + date + "\r\n";
}

ICalendarBuilder.prototype.generateDTEnd = function (date) {
    return "DTEND:" + date + "\r\n";
}

ICalendarBuilder.prototype.generateDTStamp = function (date) {
    return "DTSTAMP:" + date + "\r\n";
}

ICalendarBuilder.prototype.generateEventFromCourse = function (day, data, start = false, end = false) {
    let result = '';
    result += this.headerEvent;
    result += this.generateSummary(data.name + " - " + data.type);
    result += this.generateUID();
    result += this.generateStatus("CONFIRMED");
    result += this.generateBusy("TRANSPARENT");
    result += this.generateFrequency(day, end);
    if (start !== false){
        result += this.generateDTStamp(start.replaceAll('-', '') + "T000000")
    } else {
        result += this.generateDTStamp(this.generateDateFormat(new Date(Date.now())))
    }
    result += this.generateDTStart(this.generateDateFromCourse(day, data.start, start));
    result += this.generateDTEnd(this.generateDateFromCourse(day, data.end, start));
    result += this.generateLocation(data.classrooms);
    result += this.footerEvent;
    return result;
}

ICalendarBuilder.prototype.buildCalendarFromSchedule = function (data, start = false, end = false) {
    let icsData = '';
    icsData += this.header;
    for (const day in data) {
        //Object.keys(ICalendarDay);
        for (const course of data[day]) {
            icsData += this.generateEventFromCourse(day, course, start, end);
        }
    }
    icsData += this.footer;
    fs.writeFileSync("calendar.ics", icsData);
}

export default ICalendarBuilder;

/*
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZContent.net//Zap Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Abraham Lincoln
UID:c7614cff-3549-4a00-9152-d25cc1fe077d
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:TRANSPARENT
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU,MO,TU,WE,TH,FR,SA
DTSTART:20080212
DTEND:20080213
DTSTAMP:20150421T141403
CATEGORIES:U.S. Presidents,Civil War People
LOCATION:Hodgenville\, Kentucky
GEO:37.5739497;-85.7399606
DESCRIPTION:Born February 12\, 1809\nSixteenth President (1861-1865)\n\n\n
 \nhttp://AmericanHistoryCalendar.com
URL:http://americanhistorycalendar.com/peoplecalendar/1,328-abraham-lincol
 n
END:VEVENT
END:VCALENDAR
 */
 
