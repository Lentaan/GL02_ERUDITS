import Schedule from "../Schedule.js";
import UE from "../UE.js";
import Course from "../Course.js";

describe("", function () {
    beforeAll(function() {
        this.schedule = new Schedule();
        this.testUe = new UE();
        this.testUe.name = "AP03";
        this.testUe2 = new UE();
        this.testUe2.name = "NF19";
        this.testCourse = new Course()
        this.testCourse.name = "AP03"
        this.testCourse2 = new Course()
        this.testCourse2.name = "AP03"
        this.testUe.addCourse(this.testCourse);
        this.testUe.addCourse(this.testCourse2);
        this.schedule.addUE(this.testUe);
        this.schedule.addUE(this.testUe2);

    });

    it("can create a new schedule", function(){
        expect(this.schedule).toBeDefined();
    });

    it("can create a ue", function () {
        expect(this.testUe).toBeDefined();
        expect(this.testUe.name).toEqual("AP03")
    })

    it("can create a course", function () {
        expect(this.schedule.getSchedule())
    })

    it("can add a ue with push", function () {
        expect(this.schedule.ues[0]).toBe(this.testUe);
        expect(this.schedule.ues[1]).toBe(this.testUe2);
    })

    it("can add a course with push", function () {
        expect(this.testUe.courses[0]).toBe(this.testCourse);
        expect(this.testUe.courses[1]).toBe(this.testCourse2);
    })

    it("can get schedule and change schedule", function () {
        expect(this.schedule.getSchedule()).toEqual({'L': [this.testCourse, this.testCourse2], 'MA': [], 'ME': [], 'J': [], 'V': [], 'S': [], 'D': []})
        this.schedule.ues[0].courses[0].start = (new Date(Date.now())).setHours(8, 30)
        this.schedule.ues[0].courses[0].end = (new Date(Date.now())).setHours(10, 30)
        this.schedule.ues[0].courses[0].day = "Vendredi"
        expect(this.schedule.getSchedule()).toEqual({'L': [this.testCourse2], 'MA': [], 'ME': [], 'J': [], 'V': [this.testCourse], 'S': [], 'D': []})
    })

    it("can get only the ue we want by day", function () {
        expect(this.schedule.getScheduleByDay("V", "AP03")).toEqual([this.testCourse])
        expect(this.schedule.getScheduleByDay("L", ["AP03"])).toEqual([this.testCourse2])
        expect(this.schedule.getScheduleByDay("V", ["NF19"])).toEqual([])
    })

    it("can get only the ue we wants by schedule", function () {
        expect(this.schedule.getSchedule([])).toEqual({'L': [this.testCourse2], 'MA': [], 'ME': [], 'J': [], 'V': [this.testCourse], 'S': [], 'D': []})
        expect(this.schedule.getSchedule(["AP03"])).toEqual({'L': [this.testCourse2], 'MA': [], 'ME': [], 'J': [], 'V': [this.testCourse], 'S': [], 'D': []})
        expect(this.schedule.getSchedule(["NF19"])).toEqual({'L': [], 'MA': [], 'ME': [], 'J': [], 'V': [], 'S': [], 'D': []})
    })

    xit("can create an ics file", function () {

    })

    it("can get date well formatted", function () {
        let date = new Date(2023, 8, 7, 5, 3);
        expect(this.schedule.getFormatDate(date)).toEqual("05h03");
    })

    it("can get course by classroom and time", function () {
        let date = [(new Date(Date.now())).setHours(9,30), (new Date(Date.now())).setHours(12,30)];
        expect(this.schedule.getScheduleByClassroomAndTimes("AP03", date, "L")).toEqual([])
        expect(this.schedule.getScheduleByClassroomAndTimes("AP03", date, "V")).toEqual([this.testCourse])
    })

})