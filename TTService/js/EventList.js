/// <reference path="~\js\timesdates.js" />
/// <reference path="~\js\entry-course.js" />
/// <reference path="~\js\event.js" />
/// <reference path="~\js\popups.js" />
/// <reference path="~\js\AddClub.js" />
/// <reference path="~\js\login.js" />
/// <reference path="~\js\TTdata.js" />
/// <reference path="~\js\AddRider.js" />
/// <reference path="~\js\index.js" />

/*global jQuery,popup,Clubs,Course,TTData,ttTime,login,Rider,Riders,Event*/

var EventList = (function ($) {
    "use strict";
    var coursesList = [],
        clubsList = [],
        clubTable, courseTable, eventTable,
        event = null;


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
                    ChangePage("home");
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

        fromdate = $("#startDate").val();
        todate = $("#endDate").val();
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
            coursename = $("#chooseEventCourse").text(),
            club = $("#chooseEventClub").text(),
            date = $("#startDate").val().split('/'),
            time = $("#startTime").val().split(':');

        datetime = new Date(date[2], date[1] - 1, date[0], time[0], time[1], 0, 0);
        timemillisec = datetime.valueOf();
        event = new Event(0, Course.getID(coursename), timemillisec, Clubs.getID(club), 0);

        ChangePage("home");
    }
    function chooseEventPage(existing) {
        while (clubsList.length > 0) {
            clubsList.pop();
        }
        while (coursesList.length > 0) {
            coursesList.pop();
        }
        Course.populateList(coursesList);
        Clubs.populateList(clubsList);


        if (existing) {
            coursesList.push(["(Any course)"]);
            clubsList.push(["(Any club)"]);
            $("#eventSubmit").unbind('click');
            $("#eventSubmit").click(loadEventAction);
        }
        else {
            $("#eventSubmit").unbind('click');
            $("#eventSubmit").click(addEventAction);
        }

        if (event !== null) {
            if (event.entries.length > 1) {
                popup.Confirm('This will remove all details for existing event - are you sure?',
                    function () {
                        event = null;
                        ChangePage('addEventPage');

                        if (clubTable !== null) {
                            $('#chooseEventClub').text("Club");
                            clubTable.destroy(true);
                        }
                        if (courseTable !== null) {
                            $('#chooseEventCourse').text("Course");
                            courseTable.destroy(true);
                        }
                        if (eventTable !== null) {
                            $("#eventSubmit").text("Search for event");
                            eventTable.destroy(true);
                        }
                    },
                    null);
            }
            else {
                ChangePage('addEventPage');
            }
        }
        else {
            ChangePage('addEventPage');
        }
    }
    $('#eventSubmit').click(function () {
        addEventAction();
    });

    $('#chooseEventClub').click(function () {
        clubTable = myTable('#clubs', { "search": "Select Club:" }, clubsList, 200, [null], null);
        $('#clubs tbody tr').on('click', function () {
            // add the club name to the button for reference
            var nTds, club;
            nTds = $('td', this);
            club = $(nTds[0]).text();
            $('#chooseEventClub').text(club);
            clubTable.destroy(true);
        });
    });

    $('#chooseEventCourse').click(function () {
        courseTable = myTable('#courses', { "search": "Select Course:" }, coursesList, 200, [null], null);
        $('#courses tbody tr').on('click', function () {
            var nTds, course;
            nTds = $('td', this);
            course = $(nTds[0]).text();
            $('#chooseEventCourse').text(course);
            courseTable.destroy(true);
        });
    });

    $('#loadEvent').click(function () {

        chooseEventPage(true);

        $("#eventSubmit").text("Search for event");
        $("#eventTitle").text("Load existing Event");
        $("#eventTime").hide();
        $("#endDate").hide();
        $("#eventTime").hide();
        $("#eventStart").hide();
        $("#eventEnd").hide();
        $("#lblEndDate").show();
        $("#endDate").show();
        $("#eventsTable").show();
        $("#LblSearch").show();

    });

    $('#addEvent').click(function () {
        if (login.checkRole() === false) {
            return;
        }
        chooseEventPage(false);
        $("#eventSubmit").text("Done");
        $("#eventTitle").text("Create new Event");
        $("#eventTime").show();
        $("#eventStart").show();
        $("#selectParams").hide();
        $("#lblEndDate").hide();
        $("#endDate").hide();
        $("#eventsTable").hide();
        $("#LblSearch").hide();

        $("#startTime").val("08:00:00");
        $("#startDate").datepicker({ changeYear: true, dateFormat: "dd/mm/yy" });
        $("#startTime").timepicker({
            timeFormat: 'HH:mm:ss',
            controlType: 'select',
            stepHour: 1,
            stepMinute: 15
        });

        //newdata = 1;
    });


    $('#addEvent').click(function () {
        addEventAction();
    });


    return {
        currentEvent: function () {
            return event;
        }
    };

}(jQuery));











