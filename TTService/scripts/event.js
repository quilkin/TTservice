﻿/*global jQuery,popup,Clubs,Course,TTData,ttTime,login,TTRider,Riders,ttApp*/

var Event = (function ($) {
    "use strict";

    var updatingEntry,

    event = function (ID, courseID, time, clubID, extraData) {
        this.CourseID = courseID;
        this.ClubID = clubID;
        this.Time = time;
        this.Entries = [];
        this.ID = ID;
        this.OddData = extraData;
        this.Synched = false;
        this.displayTimer = null;
        this.clearEntries = function () {
            this.Entries.length = 0;
            //while (this.Entries.length > 0) {
            //    this.Entries.pop();
            //}
        };
        this.sortingRequired = false;

        // intellisense helper
        this.Entries[0] = new TTEntry(0, 0, 0, 0);

        this.distance = function (courseID) {
            return Course.getDistance(courseID);
        };
        this.loadEntries = function (entries) {

            this.Entries.length = 0;
            entries.forEach(function(entry){
                // convert json list into list of entry objects
                this.Entries.push(new TTEntry(entry.Number, entry.Start, entry.Finish, entry.RiderID));
            },this);
        };
        this.getEntries = function () {
            return this.Entries;
        };
        this.nextAvailableEntry = function () {
            // find the unused missing entry number. The numbers won't necessarily be in sequence, so this algorithm isn't a simple/quick as it could be
            var i, entry, highest=0, tryThis;
            // find max number
            for (i = 0; i < this.Entries.length; i += 1) {
                entry = this.Entries[i];
                if (entry.Number > highest) {
                    highest = entry.Number;
                }
            }
            for (tryThis = 1; tryThis <= highest ; tryThis += 1) {
                var found = $.grep(this.Entries, function (a) {
                    return a.Number === tryThis;
                });
                if (found.length == 0) {
                    return tryThis;
                }
            };
            return highest + 1;

        };
        this.getTime = function () {
            return this.Time;
        };
        this.pastEvent = function () {

            var diff, now = new Date().valueOf();
            if (this.ID === 0) {
                return false;
            }
            diff = this.Time - now;
            return (diff < 0);
        };
        this.getEntryFromRiderID = function (riderID) {
            var i, entry;
            for (i = 0; i < this.Entries.length; i+=1) {
                entry = this.Entries[i];
           // $.each(this.Entries, function () {
                if (entry.RiderID === riderID) {
                    return entry;
                }
            }
            return null;
        };
        this.getEntryFromNumber = function (number) {
            var i, entry;
            for (i = 0; i < this.Entries.length; i += 1) {
                entry = this.Entries[i];
                if (entry.Number=== number) {
                    return entry;
                }
            }
            return null;
        };
        this.getEntryFromName = function (name) {
            var i, entry;
            for (i = 0; i < this.Entries.length; i += 1) {
                entry = this.Entries[i];
                var rider = Riders.riderFromID(entry.RiderID);
                if (rider.Name.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
                    return entry;
                }
            }
            return null;
        };
        this.getRiderFromNumber = function (number) {
            var i, entry;
            for (i = 0; i < this.Entries.length; i += 1) {
                entry = this.Entries[i];
                if (entry.Number === number) {
                    return entry.RiderID;
                }
            }
            return null;
        };
        this.sync = function () {
            this.Synched = true;
        };

        this.details = function () {
            if (this.ClubID < 1) {
                return "No club for event";
            }
            return Clubs.getName(this.ClubID) + ": " + ttTime.dateTimeString(this.Time) + " (" + Course.getName(this.CourseID) + ")";
        };

        this.resultsBoard = function () {

            if (this.Entries.length < 1) {
                popup.alert("No event loaded, or no riders in event!");
                return;
            }

            ttApp.changePage("resultsboard");

            var thisEvent = this,

                rideTime,
                rideTimeString,
                rider,
                rows = this.Entries.length / 3 + 1,
                height = $(window).height() - 100,
                row,
                col,
                htmlline;

            // set a timer to refresh the results every 60 seconds
            this.displayTimer = setInterval(function () {
                
                // get new results from web
                TTData.json('LoadEntries', "POST", thisEvent, function (entries) { thisEvent.loadEntries(entries); });
                // compares entries and sorts in order of start number, lowest first
                thisEvent.Entries.sort(function (a, b) {
                    return a.Number - b.Number;
                });
                // make a set of three tables in columns
                var entries = thisEvent.Entries;
                var array1 = [], array2 = [], array3 = [],
                    table1, table2, table3;
                row = 0;
                col = 0;
                entries.every(function (entry, index) {
                    if (row >= rows) {
                        row = 0; ++col;
                    }
                    rider = Riders.riderFromID(entry.RiderID);
                    if (entry.Finish / 1000 < ttTime.noTimeYet() / 1000) {
                        // rider has finished event,

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

                    }
                    else {
                        rideTimeString = "waiting";
                    }
                    switch (col) {
                        case 0: array1.push([entry.Number, rider.Name, rideTimeString]); break;
                        case 1: array2.push([entry.Number, rider.Name, rideTimeString]); break;
                        case 2: array3.push([entry.Number, rider.Name, rideTimeString]); break;
                    }
                    ++row;
                    return true;
                });
                table1 = new TTTable('#triple1', 
                    [{ "title": "","width": "10%" },
                        { "title": "" },
                        { "title": "", "width": "10%" }],
                    "", array1, height, null, false);
                table1.show(null);

                table2 = new TTTable('#triple2', 
                    [{ "title": "", "width": "10%" },
                        { "title": "" },
                        { "title": "", "width": "10%" }],
                    "", array2, height, null, false);
                table2.show(null);

                table3 = new TTTable('#triple3',
                    [{ "title": "", "width": "10%" },
                        { "title": "" },
                        { "title": "", "width": "10%" }],
                    "", array3, height, null, false);
                table3.show(null);

                $('#tableArray').trigger('create');
                }, 10000);


        }
        this.results = function () {
            if (this.Entries.length < 1) {
                popup.alert("No event loaded, or no riders in event!");
                return;
            }

            // compares entries and sorts in order of result time, lowest first
            this.Entries.sort(function (a, b) {
                var result = (a.Finish - a.Start) - (b.Finish - b.Start);
                if (result !== 0) {
                    return result;
                }
                return a.Number - b.Number;
            });

            var pos = 0,
                results1 = [],
                results2 = [],
                results3 = [],
                rider,
                rideTimeString,
                rideTime,
                stdTime,
                age,
                start, finish,
                rider4049=null, rider5059=null,
                rider6069=null, rider70=null;

            // first do a table in finishing order

            this.Entries.forEach(function (entry) {
                pos += 1;
                entry.Position = pos;
                rider = Riders.riderFromID(entry.RiderID);
                var distance = this.distance(this.CourseID);
                stdTime = rider.vetStandardTime(distance);
                start = entry.Start;
                finish = entry.Finish;

                if (stdTime > 0) {
                    entry.VetOnStd = (finish - start - stdTime);
                }
                else {
                    entry.VetOnStd = 0;
                }
                rideTime = finish - start;
                if (finish / 1000 === ttTime.didNotStart() / 1000) {
                    rideTimeString = "DNS";
                    entry.VetOnStd = 0;
                }
                else if (finish / 1000 === ttTime.didNotFinish() / 1000) {
                    rideTimeString = "DNF";
                    entry.VetOnStd = 0;
                }
                if (finish < ttTime.specialTimes()) {
                    rideTimeString = ttTime.timeStringH1(rideTime);
                }
                results1.push([entry.Position, entry.Number, rider.ID, rider.Name,
                    ttApp.isMobile() ? Clubs.getAbbr(rider.ClubID) : Clubs.getName(rider.ClubID),
                    rideTimeString,
                    ttTime.timeStringVetStd(entry.VetOnStd)]);
                // decide on vet's age group prizes
                age = rider.age();
                if (age >= 70 && rider70 === null) {
                    rider70 = rider;
                    results2.push(['70+', rider.Name, rideTimeString]);
                }
                else if (age >= 60 && age < 70 && rider6069 === null) {
                        rider6069 = rider;
                        results2.push(['60-69', rider.Name, rideTimeString]);
                }
                else if (age >= 50 && age < 60 && rider5059 === null) {
                    rider5059 = rider;
                    results2.push(['50-59', rider.Name, rideTimeString]);
                }
                else if (age >= 40 && age < 50 && rider4049 === null) {
                    rider4049 = rider;
                    results2.push(['40-49', rider.Name, rideTimeString]);
                }
    
            }, this);


            ttApp.changePage("resultpage");
            if (ttApp.isMobile()) {
                $('#btnEmailResult').hide();
            }
            if (login.checkRole() === false) {
                $('#btnEmailResult').hide();
            }
            $('#resultsTitle').text(this.details());

            var table = new TTTable('#results',
                [ { "sTitle": "pos" },
                  { "sTitle": "no:" },
                  { "sTitle": "#", "visible":false },
                  { "sTitle": "name" },
                  { "sTitle": "club" },
                  { "sTitle": "time" },
                  { "sTitle": "vet+" }],
                "", results1, 300, null, true);
            table.tableDefs.filter = false;
            table.show(function (data) {
                rider = Riders.riderFromID(data[2]);
                if (rider !== undefined && rider !== null) {
                    ttApp.changePage("riderDetailsPage");
                    rider.displayRider(true);
                }
            });

            // now need a revised entry list that only includes riders that have a finish time
            var finishedEntries = [],
                club,
                nextRider, nextClub = 0,
                timesForClub = [],
                clubsWith3Entries = [],
                i, entry, len;

            for (i = 0; i < this.Entries.length; i += 1) {
                entry = this.Entries[i];
                start = entry.Start;
                finish = entry.Finish;
                rideTime = finish - start;
                if (finish < ttTime.specialTimes()) {
                    rider = Riders.riderFromID(entry.RiderID);
                    club = rider.ClubID;
                    finishedEntries.push([club, rider.ID, rider.Name, rideTime, rider.DoB]);
                }
            }
            // now do a table for fastest in each vet's age group (40-49, 50-59, 60-69, 70+)
            // First, compare entries and sort in order of dob
            //finishedEntries.sort(function (a, b) {
            //    return a[4] - b[4];
            //});
            //results2 = [];
            //len = finishedEntries.length;
            //var now = new Date().valueOf() ;
            //for (i = 0; i < len; i += 1) {
            //    entry = finishedEntries[i];
            //    rider = finishedEntries[i][2];
            //    rideTime = finishedEntries[i][3];
            //    rideTimeString = ttTime.timeStringH1(rideTime);
            //    age = (now - finishedEntries[i][4]) / 31536000000; // (1000 * 3600 * 24 * 365);

            //    results2.push([
            //        age,
            //        rider,
            //        rideTimeString
            //    ]);
            //}
            var vetTable = new TTTable("#vetResults",
                [   { "title": "Vets Results by Age", "orderable": false },
                    { "title": "", "orderable": false },
                    { "title": "times", "orderable": false }],
                        "", results2, 300, null, true);
            vetTable.tableDefs.filter = false;
            vetTable.show(null);

            // now do a summary table in clubs order, and calculate team prizes
            // First, compare entries and sort in order of club
            finishedEntries.sort(function (a, b) {
                var riderA = Riders.riderFromID(a[1]),
                    riderB = Riders.riderFromID(b[1]),
                    clubA = riderA.ClubID,
                    clubB = riderB.ClubID;
                return Clubs.getName(clubA).localeCompare(Clubs.getName(clubB));
            });
            results3 = [];

            len = finishedEntries.length;
            for (i = 0; i < len; i += 1) {
                entry = finishedEntries[i];
                if (i < len - 1) {
                    nextClub = finishedEntries[i + 1][0];
                }
                else {
                    nextClub = -1;
                }
                club = finishedEntries[i][0];
                rider = finishedEntries[i][2];
                rideTime = finishedEntries[i][3];
                rideTimeString = ttTime.timeStringH1(rideTime);
                results3.push([
                    Clubs.getName(club),
                    rider,
                    rideTimeString
                ]);
                // accumulate all of the club's times
                timesForClub.push([rider, rideTime]);
                if (club !== nextClub) {
                    // found all finishers for this club. Calculate best 3 times, insert an extra line of results and start next club.
                    if (timesForClub.length >= 3) {
                        var clubName = Clubs.getName(club),
                            riderList = timesForClub[0][0] + ', ' + timesForClub[1][0] + ', ' + timesForClub[2][0],
                            totalTime = (ttTime.timeStringH1(timesForClub[0][1] + timesForClub[1][1] + timesForClub[2][1])).toString();
                        timesForClub.sort(function (a, b) { return a[1] - b[1] });
                        clubsWith3Entries.push([
                            clubName, riderList, totalTime
                        ]);

                    }
                    timesForClub = [];
                }
            }
            // sort potential winning clubs into accumulative time order
            clubsWith3Entries.sort(function (a, b) {
                return a[2].localeCompare(b[2]);
            });
            // modify club names with postion and add (up to 9 of) them to main list
            var club;
            for (i = 0; i < clubsWith3Entries.length && i < 9; i += 1) {
                club = clubsWith3Entries[i];
                club[0] = (i + 1) + ": " + club[0];
                results3.push(club);
            };

            var clubTable = new TTTable("#clubResults",
                [       { "title": "Results by Club", "orderable": false },
                        { "title": "", "orderable": false },
                        { "title": "times", "orderable": false }],
                "", results3, 300, null, true);
            clubTable.tableDefs.filter = false;
            clubTable.show(null);
        }
        this.displayEvent = function () {
            var rider,
                self,
                table,
                entrydata = [],
                target, cat,
                stdTime, stdTimeStr;

            if (this.Entries.length < 1) {
                popup.alert("No riders entered!");
                return;
            }

            ttApp.changePage("entrypage");

            if (ttApp.isMobile()) {
                $('#btnEmailStart').hide();
            }
            if (login.checkRole() === false) {
                $('#btnEmailStart').hide();
            }

            if (ttApp.screenWidth() < 500) {
                this.Entries.forEach(function(entry){
                    rider = Riders.riderFromID(entry.RiderID);
                    if (rider === null) {
                        rider = new TTRider(entry.RiderID, "Rider not found", 0, 1, 0, "");
                    }
                    entrydata.push([entry.Number, rider.ID, rider.Name, Clubs.getAbbr(rider.ClubID), ttTime.timeString(entry.Start)]);
                });
                table = new TTTable('#entries',
                     [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Start" }],
                    "Find entry", entrydata, ttApp.tableHeight(), null, true);
 
            }
            else {
                // more details
                this.Entries.forEach(function(entry) {
                    rider = Riders.riderFromID(entry.RiderID);
                    if (rider === null) {
                        rider = new TTRider(this.RiderID, "Rider not found", 0, 1, 0, "", 0);
                    }
                    target = "";
                    if (rider.hasBest25()) {
                        target = ttTime.timeStringH1(rider.Best25 * 1000);
                    }
                    cat = rider.catAbbr();
                    stdTime = rider.vetStandardTime(this.distance());
                    stdTimeStr = stdTime > 0 ? ttTime.timeStringH1(stdTime) : "";
                    entrydata.push([entry.Number, rider.ID, rider.Name, cat, stdTimeStr, target, Clubs.getName(rider.ClubID), ttTime.timeString(entry.Start)]);
                },this);
                table = new TTTable('#entries',
                    [   { "title": "#" },
                        { "title": "#", "visible":false },
                        { "title": "Name" },
                        { "title": "Cat" },
                        { "title": "VetStd" },
                        { "title": "Target" },
                        { "title": "Club" },
                        { "title": "Start" }  ],
                    "Find entry", entrydata, ttApp.tableHeight(), null, true);
            }
            table.show(function(data){
            // *********** ToDo: allow deletion of entries but only if event hasn't happened

                ttApp.changePage("riderDetailsPage");
                rider = Riders.riderFromID(data[1]);
                rider.displayRider(true);
            });
        };
        this.updateEventTimes = function () {

            if (this.Entries.length < 1) {
                popup.alert("No riders entered!");
                return;
            }
            ttApp.changePage("timesPage");

            var entrydata = [],
                rider, rideTime, rideTimeString,
                table;

            //$.each(this.Entries, function () {
            this.Entries.forEach(function(entry){
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
                entrydata.push([entry.Number, rider.Name, Clubs.getAbbr(rider.ClubID), rideTimeString]);
            });
            table = new TTTable('#times',
                [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Time" }],
                "Find entry", entrydata, ttApp.tableHeight() - 100, null, false);

            table.tableDefs.order = [1, 'asc'];
            table.show(function(data){
                //var    name = $(nTds[1]).text(),
                var name = data[1],
                    rtime = data[3];
                updatingEntry = data[0];
                //updatingEntry = parseInt($(nTds[0]).text(), 10);


                $('#riderTime').val(rtime);
                $('#riderTimeLabel').text(name);
            });
            
            $("#riderTime").timepicker({
                showSecond: true,
                timeFormat: 'HH:mm:ss',
                controlType: 'select',
                stepHour: 1,
                stepMinute: 1,
                stepSecond: 1

            });
        };
        this.saveRiderTime = function () {
            var endTime = ttTime.noTimeYet(),
                startTime, rideTimeS, rideTimeD;

            startTime = this.Time + 1000 * 60 * updatingEntry;
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

            //$.each(this.Entries, function (entry) {
            this.Entries.forEach(function(entry){
                if (updatingEntry === entry.Number) {
                    entry.Finish = endTime;
                    this.updateEventTimes();
                }
            },this);
        };
        this.prepareSortEvent = function () {
            //var evID = currentEvent.ID;
            this.sortingRequired = true;
            if (login.checkRole() === false) {
                return;
            }
            // first save any new riders & clubs - also saves event 
            Riders.saveRiderData(this);
        };
        this.prepareSaveEvent = function () {
            if (login.checkRole() === false) {
                return;
            }
            // first save any new clubs and riders, and deal with responses, before saving the event
            Riders.saveRiderData(this);
        };
        this.saveEvent = function () {
            var self = this;
            if (self.sortingRequired) {
                // must save before sorting
                TTData.json("SaveEvent", "POST", self, function () {
                    TTData.json('SeedEntries', "POST", self, function (response) {
                        if (response.length < self.Entries.length) {
                            popup.alert("Error with sorting, so not perfomed");
                        }
                        else {
                            self.Entries.length = 0;
                            response.forEach(function (entry) {
                                self.Entries.push(entry);
                            });
                            popup.alert("Sorting done");
                        }
                        self.sortingRequired = false;
                        self.displayEvent();
                    });
                });
            }
            else {
                TTData.json("SaveEvent", "POST", this, function (response) {
                    popup.alert(response);
                });
            }
        };
        this.emailStart = function () {
            if (login.checkRole() === false) {
                return;
            }
            // ***************** comment out until debugged!
            //TTData.json("EmailStartSheet", "POST", this.ID, function (response) { popup.alert(response); }, true);
        };
        this.emailResults = function () {
            if (login.checkRole() === false) {
                return;
            }
            // ***************** comment out until debugged!
            //TTData.json("EmailResultSheet", "POST", this.ID, function (response) { popup.alert(response); }, true);
        };
        this.startLine = function () {
            if (login.checkRole() === false) {
                return;
            }
            if (this.Synched) {
                popup.alert("Cannot re-sync after any riders have finished");
                return;
            }
            ttApp.changePage("startLinePage");
        };
        this.syncStart = function () {
            if (this.Synched) {
                popup.alert("Cannot re-sync unless app is restarted");
                return;
            }
            // adjust start time to match another stopwatch
            var d = new Date(),
            // timediff will be positive if event started 'late'
                timediff = d.valueOf() - this.Time;

            this.Time = d.valueOf();
            // now need to adjust start times of all entrants
            //$.each(this.Entries, function () {
            this.Entries.forEach(function(entry){
                entry.Start += timediff;
            });
            // cannot sync start time again 
            this.sync();
            $("#finish")[0].play();
            ttApp.changePage("home");
        };
        this.sortEntries = function () {
            // compares entries and sorts in order of start, but with those already finished shifted to the end
            this.Entries.sort(function (a, b) {
                var result = b.Finish - a.Finish;
                if (result !== 0) {
                    return result;
                }
                return a.Number - b.Number;
            });
        };
        //$('#saveRiderTime').click(function () {
        //    saveRiderTime();
        //});
    };
    return event;
}(jQuery));