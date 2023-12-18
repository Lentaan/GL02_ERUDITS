import UE from "./UE.js";
import Schedule from "./Schedule.js";
import Course, {Day} from "./Course.js";
import path from "path";
import fs from "fs";

const CruParser = function () {
    this.courseSymbs = ["S", "P", "H", ''];
    this.ueSymb = ['+', 'UVUV'];
    this.errorCount = 0;
    this.schedule = new Schedule();
    this.files = [];
}

const { resolve } = path;
const { readdirSync } = fs;

CruParser.prototype.getFiles = function(dir) {
    const dirents = readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            this.getFiles(res);
        } else {
            this.files.push(res);
        }
    }
}

CruParser.prototype.parseDirectory = function(directory) {
    this.getFiles(directory);
    const parser = this;
    this.files.forEach(function (value) {
        const fileName = value.split(/[\/\\]/).pop();
        if (/.+\.cru$|.+\.CRU$/.test(fileName)){
            console.log("File parsing : ", value);
            const rawData = fs.readFileSync(value, {encoding: "utf8"});
            parser.parse(rawData);
            console.log("End parsing file")

        }
    })
    return true;
}

CruParser.prototype.tokenizeSchedule = function(data){
    const separator = /(\r\n|\n| - )/;
    data = data.split(separator);
    data = data.filter((val) => !val.match(separator));
    return data;
}



CruParser.prototype.tokenizeCourse = function(data) {
    const separator = /([,=\/])/;
    data = data.split(separator);
    data = data.filter((val) => !val.match(separator));
    return data;
}

CruParser.prototype.parse = function (strData) {
    const data = this.tokenizeSchedule(strData);

    // First input is the namefile, check if right extension
    if (/\.cru|\.CRU/.test(data[0])){
        this.schedule.filename = data[0];
    } else {
        this.errMsg("Error on the name file", data[0])
        return false;
    }
    this.next(data);

    // Next input is the name of the schedule
    this.schedule.title = this.next(data);
    let input = this.next(data);

    // The next 3 are the description
    while(input[0] !== '+'){
        // Add \n that was remove by the split
        this.schedule.description += "\n" + input;
        input = this.next(data);
    }

    while(true){
        // Check if is an example
        if (this.check("UVUV", this.ueSymb, input.replace('+',''))){
            this.schedule.exemple = input.replace('+','');
            this.parseFormat(data);
            input = this.next(data);
        } else if (this.check("+", this.ueSymb, input[0])) {
            input = this.parseUE(data, input);
            if (!input && input !== ''){
                this.errMsg("Error in parsing UE", input)
                return false;
            }
        } else {
            break;
        }
    }
    this.expect('', input);
}

CruParser.prototype.parseFormat = function(data) {
    this.schedule.format += this.next(data) + "\n";
    this.schedule.format += this.next(data);
}


CruParser.prototype.accept = function(s, type){
    const idx = type.indexOf(s);
    // index 0 exists
    if(idx === -1){
        //this.errMsg("symbol "+s+" unknown", type);
        return false;
    }

    return idx;
}

CruParser.prototype.check = function (s, type, input) {
    return this.accept(input, type) === this.accept(s, type);
}

CruParser.prototype.expect = function (symb, input) {
    if(input === symb) {
        return true;
    } else {
        this.errMsg("This expected the '"+symb+"' symbole ", input)
    }
}

CruParser.prototype.checkFormat = function(input, pattern, message){
    if (!pattern.test(input)){
        this.errMsg(message, input)
        return false;
    }
    return true;
}

CruParser.prototype.parseCourse = function (input) {
    const data = this.tokenizeCourse(input);
    let course = new Course();
    let inputCourse = this.next(data);

    if (this.checkFormat(inputCourse,/[0-9]+/, "Error of number of course")){
        course.nbCourse = inputCourse;
        inputCourse = this.next(data)
    } else {
        return false;
    }

    if (this.checkFormat(inputCourse,/[DTC][0-9]/, "Error of type of course")){
        course.type = inputCourse;
        inputCourse = this.next(data)
    } else {
        return false;
    }

    if (this.check("P", this.courseSymbs, inputCourse)){
        inputCourse = this.next(data);
        if (this.checkFormat(inputCourse,/[0-9]{1,3}/, "Error of headcount of course")){
            course.headcount = inputCourse;
            inputCourse = this.next(data);
        } else {
            this.errMsg("No headcount found for course", input)
        }
    } else {
        return false;
    }

    if (this.check("H", this.courseSymbs, inputCourse)){
        inputCourse = this.next(data);
        if (this.checkFormat(inputCourse,/([LJVSD]|ME|MA) [0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2}/, "Error of hours of course")){
            let date = inputCourse.split(/[ :-]/)
            course.day = Day[this.next(date)];
            course.start = (new Date()).setHours(Number(this.next(date)), Number(this.next(date)));
            course.end = (new Date()).setHours(Number(this.next(date)), Number(this.next(date)));
            inputCourse = this.next(data);
        } else {
            this.errMsg("No day, start and end found for course", input)
        }
    } else {
        return false;
    }

    if (this.checkFormat(inputCourse,/F[A-Z-0-9]/, "Error of group of course")){
        course.group = inputCourse;
        inputCourse = this.next(data)
    } else {
        return false;
    }

    if (this.check("S", this.courseSymbs, inputCourse)){
        inputCourse = this.next(data);
        if (this.checkFormat(inputCourse,/^[A-Z]{1,4}[0-9]{0,3}$/, "Error of classroom of course")){
            course.classrooms = inputCourse;
            this.schedule.classrooms.add(inputCourse)
            this.next(data);
        } else {
            this.errMsg("No classroom found for course", input)
        }
    } else {
        return false;
    }

    //this.expect('', this.courseSymbs, this.next(data));
    //this.expect('', this.courseSymbs, this.next(data));

    return course;
};

CruParser.prototype.parseUE = function (data, input) {
    let ue = new UE(input.replace('+', ''))
    let inputUE = this.next(data);
    while(inputUE && inputUE[0] !== '+'){
        let course = this.parseCourse(inputUE);
        if (course instanceof Course){
            course.name = ue.name;
            ue.addCourse(course);
        } else {
            this.errMsg("Error in parsing course", inputUE)
            return false;
        }
        inputUE = this.next(data);
    }
    this.schedule.addUE(ue);
    return inputUE;
}


CruParser.prototype.errMsg = function(msg, input){
    this.errorCount++;
    console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
    return input.shift();
}

export default CruParser;

