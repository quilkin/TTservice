
/// <reference path="~\js\timesdates.js" />
/// <reference path="~\js\entry-event-course.js" />
/// <reference path="~\js\popups.js" />
/// <reference path="~\js\AddClub.js" />
/// <reference path="~\js\login.js" />
/// <reference path="~\js\TTdata.js" />
/// <reference path="~\js\AddRider.js" />
/// <reference path="~\js\index.js" />

/*global jQuery,popup,Clubs,Course,TTData,ttTime,login,Rider,Riders,ttApp*/

var Event = (function ($) {
    "use strict";
    var coursesList = [],
        clubsList = [],
        clubTable, courseTable, eventTable,
        currentEvent = null,
        updatingEntry,

    event = function (ID, courseID, time, clubID, extraData) {
        this.CourseID = courseID;
        this.ClubID = clubID;
        this.Time = time;
        this.Entries = [];
        this.ID = ID;
        this.OddData = extraData;
        this.Synched = false;
    };

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
        currentEvent = null;
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
                eventID = $(nTds[0]).text();

            // find the correct event from the list
            $.each(events, function (index, ev) {
                if (ev.ID === eventID) {
                    currentEvent = new Event(ev.ID, ev.CourseID, ev.Time, ev.ClubID, 0);
                    return false;  // i.e. break out of 'each' loop
                }
            });
            if (currentEvent === null) {
                popup.alert("Error finding correct event");
                return false;
            }
            // now need to ask server for all its entries for this event
            TTData.json('LoadEntries', "POST", eventID, function (entries) {
                $.each(entries, function (index, e) {
                    currentEvent.Entries[index] = e;
                });
                // popup.alert(entries.length + " riders loaded for this event");
                if (currentEvent.pastEvent()) {
                    Results();
                }
                else {
                    // popup.alert("No results yet, event has not happened");

                    popup.alert(entries.length + " riders loaded for this (future) event");
                    ChangePage("home");
                }

            }, true);

        });
    }


    // choose an event from existing events in database, based on selection of parameters
    function loadEventAction() {

        var clubID, courseID,
            fromdate, todate, fromtime, totime,
            datemillisec, days,
            newEvent;

        clubID = Clubs.getID($("#btnClub").text());
        courseID = Course.getID($("#btnCourse").text());

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
            coursename = $("#btnCourse").text(),
            club = $("#btnClub").text(),
            date = $("#startDate").val().split('/'),
            time = $("#startTime").val().split(':');

        datetime = new Date(date[2], date[1] - 1, date[0], time[0], time[1], 0, 0);
        timemillisec = datetime.valueOf();
        currentEvent = new Event(0, Course.getID(coursename), timemillisec, Clubs.getID(club), 0);

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
            $("#eventSubmit").attr("onclick", loadEventAction);
        }
        else {
            $("#eventSubmit").attr("onclick", addEventAction);
        }

        if (currentEvent !== null) {
            if (currentEvent.Entries.length > 1) {
                popup.Confirm('This will remove all details for existing event - are you sure?',
                    function () {
                        currentEvent = null;
                        ChangePage('addEventPage');

                        if (clubTable !== null) {
                            $('#btnClub').text("Club");
                            clubTable.destroy(true);
                        }
                        if (courseTable !== null) {
                            $('#btnCourse').text("Course");
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


    function displayEvent() {

        var r, rider,
            entrydata = [],
            target, cat,
            stdTime, stdTimeStr;

        if (currentEvent.Entries.length < 1) {
            popup.alert("No riders entered!");
            return;
        }
        
        ChangePage("entrypage");

        if (ttApp.isMobile()) {
            $('#btnEmailStart').hide();
        }
        if (login.checkRole() === false) {
            $('#btnEmailStart').hide();
        }

        if (ttApp.screenWidth < 500) {
            $.each(currentEvent.Entries, function (index, entry) {
                rider = Riders.riderFromID(entry.RiderID);
                if (rider === null) {
                    rider = new Rider(entry.RiderID, "Rider not found", 0, 1, 0, "");
                }
                entrydata.push([entry.Number, rider.Name, Clubs.getAbbr(rider.getClubID()), ttTime.timeString(entry.Start)]);
            });
            myTable('#entries', { "search": "Find entry" }, entrydata, ttApp.tableHeight(), [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Start" }], null);
        }
        else {
            // more details
            $.each(currentEvent.Entries, function (index, entry) {
                r = Riders.riderFromID(entry.RiderID);

                if (r === null) {
                    rider = new Rider(entry.RiderID, "Rider not found", 0, 1, 0, "", 0);
                }
                else {
                    rider = new Rider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email, r.Best25);
                }
                target = "";
                if (rider.hasBest25()) {
                    target = ttTime.timeStringH1(rider.Best25 * 1000);
                }

                cat = rider.catAbbr();
                stdTime = rider.vetStandardTime(currentEvent.distance());
                stdTimeStr = stdTime > 0 ? ttTime.timeStringH1(stdTime) : "";
                entrydata.push([entry.Number, rider.Name, cat, stdTimeStr, target, Clubs.getName(rider.ClubID), ttTime.timeString(entry.Start)]);
            });
            myTable('#entries', { "search": "Find entry" }, entrydata, ttApp.tableHeight(), [{ "title": "#" }, { "title": "Name" }, { "title": "Cat" }, { "title": "VetStd" }, { "title": "Target" }, { "title": "Club" }, { "title": "Start" }], null);

        }

        // *********** ToDo: allow deletion of entries but only if event hasn't happened
        $('#entries tbody tr').on('click', function () {
            var nTds = $('td', this),
                name = $(nTds[1]).text();
            ChangePage("riderDetailsPage");

            rider = Riders.riderFromName(name);
            rider.displayRider(true);
        });
    }

    function updateEventTimes() {

        if (currentEvent.Entries.length < 1) {
            popup.alert("No riders entered!");
            return;
        }
        ChangePage("timesPage");

        var entrydata = [],
            rider, rideTime, rideTimeString,
            table;

        $.each(currentEvent.Entries, function (index, entry) {
            rider = Riders.riderFromID(entry.RiderID);
            if (rider === null) {
                rider = new Rider(entry.RiderID, "Rider not found", 0, 1, 0, "");
            }

            rideTime = entry.Finish - entry.Start;
            if (entry.Finish / 1000 === ttTime.didNotStart() / 1000) {
                rideTimeString = "DNS";
            }
            else if (entry.Finish / 1000 === ttTime.didNotFinish() / 1000) {
                rideTimeString = "DNF";
            }
            else if (entry.Finish >= ttTime.specialTimes()) {
                rideTimeString = "???";
            }
            else {
                rideTimeString = ttTime.timeStringH1(rideTime);
            }
            entrydata.push([entry.Number, rider.Name, Clubs.getAbbr(rider.getClubID()), rideTimeString]);
        });
        table = myTable('#times', { "search": "Find entry" }, entrydata, ttApp.tableHeight() - 100, [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Time" }], null);
        table.order([[1, 'asc']]);
        $("#riderTime").timepicker({
            showSecond: true,
            timeFormat: 'HH:mm:ss',
            controlType: 'select',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        });
        $('#times tbody tr').on('click', function () {
            var nTds = $('td', this),
                name = $(nTds[1]).text(),
                time = $(nTds[3]).text();
            updatingEntry = $(nTds[0]).text();

            $('#riderTime').val(time);
            $('#riderTimeLabel').text(name);
        });

    }
    function saveEvent() {
        if (login.checkRole() === false) {
            return;
        }
        // first save any new riders
        Riders.saveRiderData(true);
        TTData.json("SaveEvent", "POST", currentEvent, function (response) { popup.alert(response); }, true);
        //newdata = 0;
    }


    $('#chooseEventClub').click(function () {
        clubTable = myTable('#clubs', { "search": "Select Club:" }, clubsList, 200, [null], null);
        $('#clubs tbody tr').on('click', function () {
            // add the club name to the button for reference
            var nTds = $('td', this),
                club = $(nTds[0]).text();
            $('#btnClub').text(club);
            clubTable.destroy(true);
        });
    });

    $('#chooseCourse').click(function () {
        courseTable = myTable('#courses', { "search": "Select Course:" }, coursesList, 200, [null], null);
        $('#courses tbody tr').on('click', function () {
            var nTds = $('td', this),
                course = $(nTds[0]).text();
            $('#btnCourse').text(course);
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

    $('#eventSubmit').click(function () {
        addEventAction();
    });
    $('#displayEvent').click(function () {
        displayEvent();
    });
    $('#updateEventTimes').click(function () {
        updateEventTimes();
    });
    
    $('#btnEmailStart').click(function () {
        if (login.checkRole() === false) {
            return;
        }
        TTData.json("EmailStartSheet", "POST", currentEvent.ID, function (response) { popup.alert(response); }, true);
    });

    $('#btnEmailResults').click(function () {
        if (login.checkRole() === false) {
            return;
        }
        TTData.json("EmailResultSheet", "POST", currentEvent.ID, function (response) { popup.alert(response); }, true);
    });

    // save an updated rider's time
    $('#saveRiderTime').click(function () {
        var endTime = ttTime.noTimeYet(),
            startTime, rideTimeS, rideTimeD;

        startTime = currentEvent.Time + 1000 * 60 * updatingEntry;
        rideTimeS = $('#riderTime').val();
        if ($('#riderTime').val() === 'DNS') {
            endTime = ttTime.didNotStart();
        }
        else if ($('#riderTime').val() === 'DNF') {
            endTime = ttTime.didNotFinish();
        }
        else {
            rideTimeD = ttTime.timeFromString(rideTimeS);
            endTime = startTime + rideTimeD.valueOf();

        }
        if (endTime === null || isNaN(endTime)) {
            // not yet finished or time unknown
            endTime = ttTime.noTimeYet();
        }

        $.each(currentEvent.Entries, function (index, e) {
            //for (ev in currentEvent.Entries) {
            if (updatingEntry === e.Number) {
                e.Finish = endTime;
                updateEventTimes();
                return false; // break
            }
        });
        //newdata = 1;
    });

    $('#dns').click(function () {
        $('#riderTime').val('DNS');
    });

    $('#dnf').click(function () {
        $('#riderTime').val('DNF');
    });

    $('#saveEvent1').click(function () {
        saveEvent();
    });

    $('#saveEvent2').click(function () {
        saveEvent();
    });

    $('#newEvent').click(function () {
        addEventAction();
    });

    $('#sortEvent').click(function () {
        //var evID = currentEvent.ID;
        if (login.checkRole() === false) {
            return;
        }
        // first save any new riders
        Riders.saveRiderData(true);
        // must not be async call to ensure clubs saved before seeds call
        TTData.json("SaveEvent", "POST", currentEvent, function (response) { popup.alert(response); }, false);

        TTData.json('SeedEntries', "POST", currentEvent, function (entries) {
            $.each(entries, function (index, e) {
                currentEvent.Entries[index] = e;
            });
            displayEvent();
        }, true);
    });
    event.pastEvent = function () {
        var diff, now = new Date().valueOf();
        diff = this.Time - now;
        return (diff < 0);
    };
    event.distance = function (courseID) {
        return Course.getDistance(courseID);

    };

    event.SortEntries = function () {

        // compares entries and sorts in order of start, but with those already finished shifted to the end
        currentEvent.Entries.sort(function (a, b) {

            var result = b.Finish - a.Finish;
            if (result !== 0) {
                return result;
            }
            return a.Number - b.Number;
        });
    };
    event.SortResults = function () {
        // compares entries and sorts in order of result time, lowest first
        currentEvent.Entries.sort(function (a, b) {
            var result = (a.Finish - a.Start) - (b.Finish - b.Start);
            if (result !== 0) {
                return result;
            }
            return a.Number - b.Number;
        });

    };
    return event;

}(jQuery));











