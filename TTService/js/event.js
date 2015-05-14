/// <reference path="~\js\timesdates.js" />
/// <reference path="~\js\popups.js" />
/// <reference path="~\js\login.js" />
/// <reference path="~\js\TTdata.js" />
/// <reference path="~\js\AddRider.js" />
/// <reference path="~\js\index.js" />
/// <reference path="~\js\entry-course.js" />

/*global jQuery,popup,Clubs,Course,TTData,ttTime,login,TTRider,Riders,ttApp*/

var Event = (function ($) {
    "use strict";

    var updatingEntry,

    event = function (ID, courseID, time, clubID, extraData) {
        this.CourseID = courseID;
        this.ClubID = clubID;
        this.Time = time;
        this.entries = [];
        this.ID = ID;
        this.OddData = extraData;
        this.Synched = false;
        this.clearEntries = function () {
            while (this.Entries.length > 0) {
                this.Entries.pop();
            }
        };

        this.distance = function (courseID) {
            return Course.getDistance(courseID);
        };
        this.loadEntries = function (entries) {
            var self = this,
                entry;
            $.each(entries, function (index, e) {
                // convert json list into list of entry objects
                entry = new Entry(e.Number, e.Start, e.Finish, e.RiderID);
                self.entries.push(entry);
            })
        };
        this.getEntries = function () {
            return this.entries;
        }
        this.getTime = function () {
            return this.Time;
        }
        this.pastEvent = function () {
            var diff, now = new Date().valueOf();
            diff = this.Time - now;
            return (diff < 0);
        };
        this.getEntryFromRiderID = function (riderID) {
            //if (event == null)
            //    return 0;
            var entry = null;
            $.each(this.entries, function (index, e) {
                if (e.getRiderID() === riderID) {
                    entry = e;
                    return false;
                }
            });
            return entry;
        };
        this.results = function () {
            
            if (this.entries.length < 1) {
                popup.alert("No event loaded, or no riders in event!");
                return;
            }

            // compares entries and sorts in order of result time, lowest first
            this.entries.sort(function (a, b) {
                var result = (a.Finish - a.Start) - (b.Finish - b.Start);
                if (result !== 0) {
                    return result;
                }
                return a.Number - b.Number;
            });
            
            var pos = 1,
                results = [],
                self = this,
                title, table, file;

            $.each(this.entries, function (index, entry) {
                entry.setPosition(pos++);
                var rider = Riders.riderFromID(entry.getRiderID()),
                    //rider = new TTRider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email, r.Best25),
                    stdTime = rider.vetStandardTime(self.distance()),
                    rideTimeString, rideTime,
                    start = entry.getStart(),
                    finish = entry.getFinish();

                if (stdTime > 0) {
                    entry.setVet(finish - start - stdTime);
                }
                else {
                    entry.setVet(0);
                }
                rideTime = finish - start;
                if (finish / 1000 === ttTime.didNotStart() / 1000) {
                    rideTimeString = "DNS";
                    ntry.setVet(0);
                }
                else if (finish / 1000 === ttTime.didNotFinish() / 1000) {
                    rideTimeString = "DNF";
                    ntry.setVet(0);
                }
                else if (finish >= ttTime.specialTimes()) {
                    return true;          //continue, don't add to list
                }
                else {
                    rideTimeString = ttTime.timeStringH1(rideTime);
                }

                results.push([entry.getPos(), entry.getNum(), rider.getName(), ttApp.isMobile() ? Clubs.getAbbr(rider.getClubID()) : Clubs.getName(rider.getClubID()), rideTimeString, ttTime.timeStringVetStd(entry.getVet())]);

            });

            ChangePage("resultpage");
            if (ttApp.isMobile()) {
                $('#btnEmailResult').hide();
            }
            if (login.checkRole() == false) {
                $('#btnEmailResult').hide();
            }
            title = Clubs.getName(this.ClubID) + " " + ttTime.dateTimeString(this.Time) + " " + Course.getName(this.CourseID);
            $('#resultsTitle').text(title);

            resultsTableRiders(results);

            results = [];
            $.each(this.entries, function (index, entry) {
                //entry.Position = pos++;
                var rider = Riders.riderFromID(entry.RiderID),
                    // rider = new TTRider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email, r.Best25),
                    stdTime = rider.vetStandardTime(self.distance()),
                    rideTimeString, rideTime;

                if (stdTime > 0) {
                    entry.VetOnStd = entry.Finish - entry.Start - stdTime;
                }
                else {
                    entry.VetOnStd = 0;
                }
                rideTime = entry.Finish - entry.Start;
                if (entry.Finish / 1000 === ttTime.didNotStart() / 1000) {
                    rideTimeString = "DNS";
                    entry.VetOnStd = 0;
                }
                else if (entry.Finish / 1000 === ttTime.didNotFinish() / 1000) {
                    rideTimeString = "DNF";
                    entry.VetOnStd = 0;
                }
                else if (entry.Finish >= ttTime.specialTimes()) {
                    return true;          //continue, don't add to list
                }
                    //rideTimeString = "???";
                else
                    rideTimeString = ttTime.timeStringH1(rideTime);

                results.push([Clubs.getAbbr(rider.getClubID()), entry.Number, rider.getName(), rideTimeString, ttTime.timeStringVetStd(entry.VetOnStd)]);

            });
            file = Clubs.getName(this.ClubID) + " " + ttTime.dateTimeString(this.Time) + " " + Course.getName(this.CourseID);
            resultsTableSummary(results, file);

        }
    };


    function displayEvent() {

        var r, rider,
            entrydata = [],
            target, cat,
            stdTime, stdTimeStr;

        if (event.Entries.length < 1) {
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

        if (ttApp.screenWidth() < 500) {
            $.each(this.entries, function (index, entry) {
                rider = Riders.riderFromID(entry.RiderID);
                if (rider === null) {
                    rider = new TTRider(entry.RiderID, "Rider not found", 0, 1, 0, "");
                }
                entrydata.push([entry.Number, rider.Name, Clubs.getAbbr(rider.getClubID()), ttTime.timeString(entry.Start)]);
            });
            myTable('#entries', { "search": "Find entry" }, entrydata, ttApp.tableHeight(), [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Start" }], null);
        }
        else {
            // more details
            $.each(this.entries, function (index, entry) {
                rider = Riders.riderFromID(entry.RiderID);

                if (rider === null) {
                    rider = new TTRider(entry.RiderID, "Rider not found", 0, 1, 0, "", 0);
                }

                target = "";
                if (rider.hasBest25()) {
                    target = ttTime.timeStringH1(rider.Best25 * 1000);
                }

                cat = rider.catAbbr();
                stdTime = rider.vetStandardTime(event.distance());
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
                rider = new TTRider(entry.RiderID, "Rider not found", 0, 1, 0, "");
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





    event.sortEntries = function () {

        // compares entries and sorts in order of start, but with those already finished shifted to the end
        this.entries.sort(function (a, b) {

            var result = b.Finish - a.Finish;
            if (result !== 0) {
                return result;
            }
            return a.Number - b.Number;
        });
    };


    
    return event;

}(jQuery));