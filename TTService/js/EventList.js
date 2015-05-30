
/*global jQuery,popup,Clubs,Course,TTData,ttTime,login,Rider,Riders,Event,ttApp*/

var EventList = (function ($) {
    "use strict";
    var coursesList = [],
        clubsList = [],
        clubTable = null, courseTable = null, eventTable = null,
        event = new Event(0,0,0,0,0);       // just to help with intellisense...


    function parseEvents(response) {
        var eventData = [],
            events = response;

        if (events.length === 0) {
            $('#eventsTable').html('No matching events found');
            return;
        }
        $('#events').empty();

        $.each(events, function (index, ev) {
            var date = new Date(ev.Time);
            eventData.push([ev.ID, Clubs.getName(ev.ClubID), Course.getName(ev.CourseID), ttTime.dateTimeString(date)]);

        });
        event = null;
        eventTable = myTable('#events', { "search": "" }, eventData, 200,
            [{ "title": "#" },
              { "title": "Club" },
              { "title": "Course" },
              { "title": "Date/Time" }],
              null);

        // trying to make first column invisible but that messes up indexing
        //var column = eventTable.column(0);
        //column.visible(false);

        $('#events tbody tr').on('click', function () {
            var nTds = $('td', this),
                eventID = parseInt($(nTds[0]).text(),10);

            // find the correct event from the list
            $.each(events, function (index, ev) {
                if (ev.ID === eventID) {
                    event = new Event(ev.ID, ev.CourseID, ev.Time, ev.ClubID, 0);
                    return false;  // i.e. break out of 'each' loop
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
                    // popup.alert("No results yet, event has not happened");
                    popup.alert(entries.length + " riders loaded for this (future) event");
                    ttApp.changePage("home");
                }
             },
            true);
        });
    }


    // choose an event from existing events in database, based on selection of parameters
    function loadEventAction() {

        var clubID, courseID,
            fromdate, todate, fromtime, totime,
            datemillisec, days,
            newEvent;

        clubID = Clubs.getID($("#chooseEventClub").text());
        courseID = Course.getID($("#chooseEventCourse").text());

        fromdate = $("#fromDate").val();
        todate = $("#toDate").val();
        fromtime = fromdate.Length > 0 ? Date.parse(fromdate) : new Date(2000, 1);
        totime = todate.Length > 0 ? Date.parse(todate) : new Date(2037, 1);
        datemillisec = fromtime.valueOf();
        days = (totime.valueOf() - datemillisec) / (1440 * 60 * 1000);
        days = days.toFixed(0);
        // use extra data field for number of days in search
        newEvent = new Event(0, courseID, datemillisec, clubID, days);
        TTData.json("LoadEvents", "POST", newEvent, parseEvents, true);
    }
    function addEventAction() {
        var datetime,
            timemillisec,
            coursename = $("#chooseNewEventCourse").text(),
            club = $("#chooseNewEventClub").text(),
            date = $("#startDate").text().split('/'),
            time = $("#startTime").text().split(':');

        datetime = new Date(date[2], date[1] - 1, date[0], time[0], time[1], 0, 0);
        timemillisec = datetime.valueOf();
        event = new Event(0, Course.getID(coursename), timemillisec, Clubs.getID(club), 0);

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
    $('#eventSearch').click(function () {
        loadEventAction();
    });
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
            event.sortEvent();
        }
    });
    $('#saveEvent1').click(function () {
        if (exists()) {
            event.saveEvent();
        }
    });

    $('#saveEvent2').click(function () {
        if (exists()) {
            event.saveEvent();
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


    function chooseClub(element) {
        clubTable = myTable('#clubs', { "search": "Select Club:" }, clubsList, 200, [null], null);
        $('#clubs tbody tr').on('click', function () {
            // add the club name to the button for reference
            var nTds, club;
            nTds = $('td', this);
            club = $(nTds[0]).text();
            element.text(club);
            clubTable.destroy(true);
        });
    }
    function chooseCourse(element) {
        courseTable = myTable('#courses', { "search": "Select Course:" }, coursesList, 200, [null], null);
        $('#courses tbody tr').on('click', function () {
            var nTds, course;
            nTds = $('td', this);
            course = $(nTds[0]).text();
            element.text(course);
            courseTable.destroy(true);
        });
    }

    $('#chooseNewEventClub').click(function () { chooseClub($('#chooseNewEventClub')); });
    $('#chooseEventClub').click(function () { chooseClub($('#chooseEventClub')); });
    $('#chooseNewEventCourse').click(function () { chooseCourse($('#chooseNewEventCourse')); });
    $('#chooseEventCourse').click(function () { chooseCourse($('#chooseEventCourse')); });

    $("#startTime").timepicker({
        timeFormat: 'HH:mm:ss',
        controlType: 'select',
        stepHour: 1,
        stepMinute: 15,
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
            $("#btnFromDate").text("between " + result);
        }
    });
    $("#toDate").datepicker({
        changeYear: true,
        dateFormat: "dd/mm/yy",
        onSelect: function (result, i) {
            $("#btnToDate").text("and " + result);
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
        }
         
        //$("#eventsTable").show();
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
        //$("#startDate").hide();
        //$("#startTime").hide();
    });

    return {
        currentEvent: function () {
            return event;
        }
    };

}(jQuery));











