var Course = (function () {
    "use strict";

    var list = [],

    // constructor
        course = function (ID, distance, name) {
            this.ID = ID;
            this.Distance = distance;
            this.Name = name;
        };

    course.parseJson = function (response) {

        list.length = 0;
        response.forEach(function (e) {
            // convert json list into list of course objects
            list.push(new Course(e.ID, e.distance, e.Name));
        });
    };
    // generate list of courses for a table
    course.populateList = function (plist) {
        plist.length = 0;
        list.forEach(function (course) {
            if (course !== undefined) {
                plist.push([course.Name]);
            }
        });
    };
    course.getName = function (courseID) {
        var i, c;
        for (i = 0; i < list.length; i++) {
            c = list[i];
            if (courseID === c.ID) {
                return c.Name;
            }
        }
        return "unknown";
    };
    course.getID = function (coursename) {
        var i, c;
        for (i = 0; i < list.length; i++) {
            c = list[i];
            if (coursename === c.Name) {
                return c.ID;
            }
        }
        return 0;
    };
    course.getDistance = function (courseID) {
        var i, c;
        for (i = 0; i < list.length; i++) {
            c = list[i];
            if (courseID === c.ID) {
                return c.Distance;
            }
        }
        return 0;
    };
    return course;
}());


var TTEntry = (function () {
    "use strict";

    // constructor
    // an entry for a single rider in a single event
    // start & end times in millisecs
    var entry = function (number, start, finish, riderID) {
        this.Number = number;
        this.Start = start;
        this.Finish = finish;
        this.RiderID = riderID;
        this.Position = 0;
        this.VetOnStd = 0;
        this.sequence = -1; // used in button grid; see FinishLine for use
    };

    return entry;
}());

