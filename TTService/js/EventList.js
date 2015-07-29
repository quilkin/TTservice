var EventList = (function ($) {
    "use strict";
    var coursesList = [],
        clubsList = [],
        clubTable = null, courseTable = null, eventTable = null,
        event = new Event(0,0,0,0,0);       // just to help with intellisense...


    function parseEvents(events) {
        var eventData = [];

        if (events.length === 0) {
            $('#eventsTable').html('No matching events found');
            return;
        }
        $('#events').empty();

        events.forEach(function(ev){
            eventData.push([ev.ID, Clubs.getName(ev.ClubID), Course.getName(ev.CourseID), ttTime.dateTimeString(new Date(ev.Time))]);
        });
        event = null;
        eventTable = new TTTable('#events',
            [ { "title": "#", "visible":false },
              { "title": "Club" },
              { "title": "Course" },
              { "title": "Date/Time" }],
            "", eventData, 300, null, false);
        eventTable.tableDefs.filter = false;
        eventTable.show(function (data) {
            var eventID = data[0];
            // find the correct event from the list
            events.some(function(ev){
                if (ev.ID === eventID) {
                    event = new Event(ev.ID, ev.CourseID, ev.Time, ev.ClubID, 0);
                    return true;  // i.e. break out of loop
                }
            });
            if (event === null) {
                popup.alert("Error finding correct event");
                return false;
            }
            // now need to ask server for all its entries for this event
            TTData.json('LoadEntries', "POST", eventID, function (entries) {
                event.loadEntries(entries);
                // popup.alert(entries.length + " riders loaded for this event");
                if (event.pastEvent()) {
                    event.results();
                }
                else {
                     popup.wait(entries.length + " riders loaded for this (future) event",
                        function () {
                            ttApp.changePage("home");
                        });
                    ttApp.changePage("home");
                }
             },
            true);
        });
    }
    
    // choose an event from existing events in database, based on selection of parameters
    function loadEventAction() {

        var clubID, courseID,
            fromdate, todate, fromdate, todate,
            fromdatemillisec,
            todatemillisec,
            days,
            newEvent;

        clubID = Clubs.getID($("#chooseEventClub").text());
        courseID = Course.getID($("#chooseEventCourse").text());

        fromdate = $("#btnFromDate").text().split('/');
        todate = $("#btnToDate").text().split('/');
        fromdate = new Date(fromdate[2], fromdate[1] - 1, fromdate[0]);
        todate = new Date(todate[2], todate[1] - 1, todate[0]);

        fromdatemillisec = fromdate.valueOf();
        if (isNaN(fromdatemillisec)) {
            fromdate = new Date(2010, 1);
            $("#btnFromDate").text(ttTime.dateString(fromdate));
            fromdatemillisec = fromdate.valueOf();
        }
        todatemillisec = todate.valueOf();
        if (isNaN(todatemillisec)) {
            todate = new Date();
            todate.setYear(todate.getFullYear() + 1);
            $("#btnToDate").text(ttTime.dateString(todate));
            todatemillisec = todate.valueOf();
        }
        days = (todate.valueOf() - fromdatemillisec) / (1440 * 60 * 1000);
        days = days.toFixed(0);
        // use extra data field for number of days in search
        newEvent = new Event(0, courseID, fromdatemillisec, clubID, days);
        TTData.json("LoadEvents", "POST", newEvent, parseEvents, true);
    }
    function addEventAction() {
        var datetime,
            timemillisec,
            coursename = $("#chooseNewEventCourse").text(),
            club = $("#chooseNewEventClub").text(),
            date = $("#btnStartDate").text().split('/'),
            time = $("#btnStartTime").text().split(':');

        datetime = new Date(date[2], date[1] - 1, date[0], time[0], time[1], 0, 0);
        timemillisec = datetime.valueOf();
        event = new Event(0, Course.getID(coursename), timemillisec, Clubs.getID(club), 0);
        event.clearEntries();
        ttApp.changePage("home");
    }
    
    function exists() {
        if (event === null) {
            popup.alert("No event loaded");
            return false;
        }
        return true;
    }
    $('#eventSubmit').click(function () {
        addEventAction();
    });
    //$('#eventSearch').click(function () {
    //    loadEventAction();
    //});
    $('#displayEvent').click(function () {
        if (exists()) {
            event.displayEvent();
        }
    });
    $('#updateEventTimes').click(function () {
        if (exists()) {
            event.updateEventTimes();
        }
    });
    $('#sortEvent').click(function () {
        if (exists()) {
            event.prepareSortEvent();
        }
    });
    $('#saveEvent1').click(function () {
        if (exists()) {
            event.prepareSaveEvent();
        }
    });

    $('#saveEvent2').click(function () {
        if (exists()) {
            event.prepareSaveEvent();
        }
    });

    $('#btnEmailStart').click(function () {
        event.emailStart();
    });

    $('#btnEmailResults').click(function () {
        event.emailResults();
    });

    $('#startLine').click(function () {
        event.startLine();
    });

    $('#btnSyncStart').click(function () {
        event.syncStart();
    });

    $('#saveRiderTime').click(function () {
        event.saveRiderTime();
    });
    $('#showResults').click(function () {
        event.results();
    });


    function chooseClub(newEvent) {

        clubTable = new TTTable('#clubs',[{ "title": "Club" }], "Select Club:", clubsList, 200, null, false);
        clubTable.show(function(data,table){
            //var club = $(nTds[0]).text();
            var club = data[0];

            if (newEvent) {
                $('#chooseNewEventClub').text(club);
            }
            else {
                $('#chooseEventClub').text(club);
            }
            table.destroy(true);
            loadEventAction();
        });
    }
    function chooseCourse(newEvent) {
        courseTable = new TTTable('#courses', [{ "title": "Course" }],"Select Course:", coursesList, 200, null, false);
        courseTable = courseTable.show(function(data,table){
            var course = data[0];
            if (newEvent) {
                $('#chooseNewEventCourse').text(course);
            }
            else {
                $('#chooseEventCourse').text(course);
            }
            table.destroy(true);
            loadEventAction();
        });
    }

    $('#chooseNewEventClub').click(function () { chooseClub(true); });
    $('#chooseEventClub').click(function () { chooseClub(false); });
    $('#chooseNewEventCourse').click(function () { chooseCourse(true); });
    $('#chooseEventCourse').click(function () { chooseCourse(false); });

    $("#startTime").timepicker({
        timeFormat: 'HH:mm:ss',
        controlType: 'select',
        stepHour: 1,
        stepMinute: 15,
        showSecond: false,
        hour: 8,
        onSelect: function (result, i) {
            $("#btnStartTime").text(result);
        }
    });
    $("#startDate").datepicker({
        changeYear: true,
        dateFormat: "dd/mm/yy",
        onSelect: function (result, i) {
            $("#btnStartDate").text(result);
        }
    });
    $("#fromDate").datepicker({
        changeYear: true,
        dateFormat: "dd/mm/yy",
        onSelect: function (result, i) {
            $("#btnFromDate").text(result);
            loadEventAction();
        }
    });
    $("#toDate").datepicker({
        changeYear: true,
        dateFormat: "dd/mm/yy",
        onSelect: function (result, i) {
            $("#btnToDate").text(result);
            loadEventAction();
        }
    });

    $("#btnStartTime").click(function () {
        $("#startTime").timepicker('show');
    });
    $("#btnStartDate").click(function () {
        $("#startDate").datepicker('show');
    });
    $("#btnFromDate").click(function () {
        $("#fromDate").datepicker('show');
    });
    $("#btnToDate").click(function () {
        $("#toDate").datepicker('show');
    });

    $('#loadEvent').click(function () {

        Course.populateList(coursesList);
        Clubs.populateList(clubsList);

        coursesList.push(["(Any course)"]);
        clubsList.push(["(Any club)"]);
        $("#toDate").text(new Date());
        $("#loadEventTables").append('<p id="coursesTable"/> <p id="clubsTable"/>');

        if (event !== null && event.Entries.length > 1) {
            popup.confirm('This will remove all details for existing event - are you sure?',
                function () {
                    event = null;
                    ttApp.changePage('loadEventPage');
                    loadEventAction();
                    if (clubTable !== null) {
                        $('#chooseEventClub').text("Club");
                        clubTable.destroy(true);
                    }
                    if (courseTable !== null) {
                        $('#chooseEventCourse').text("Course");
                        courseTable.destroy(true);
                    }
                    if (eventTable !== null) {
                        eventTable.destroy(true);
                    }
                },
                null);
        }
        else {
            ttApp.changePage('loadEventPage');
            loadEventAction();
        }
    });

    $('#addEvent').click(function () {
        if (login.checkRole() === false) {
            return;
        }
        Course.populateList(coursesList);
        Clubs.populateList(clubsList);

        $("#addEventTables").append('<p id="coursesTable"/> <p id="clubsTable"/>');
        $("#btnEventTime").text("08:00:00");

        if (event !== null && event.Entries.length > 1) {
            popup.confirm('This will remove all details for existing event - are you sure?',
                function () {
                    event = null;
                    ttApp.changePage('addEventPage');

                    if (clubTable !== null) {
                        $('#chooseNewEventClub').text("Club");
                        clubTable.destroy(true);
                    }
                    if (courseTable !== null) {
                        $('#chooseNewEventCourse').text("Course");
                        courseTable.destroy(true);
                    }
                },
                null);
        }
        else {
            ttApp.changePage('addEventPage');
        }
    });

    return {
        currentEvent: function () {
            return event;
        },
        currentDetails: function () {
            if (event===null) {
                return "No event loaded";
            }
            return event.details();
        }
    };

}(jQuery));











