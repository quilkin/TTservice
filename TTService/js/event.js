/*global jQuery,popup,Clubs,Course,TTData,ttTime,login,TTRider,Riders,ttApp*/

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
        this.clearEntries = function () {
            this.Entries.length = 0;
            //while (this.Entries.length > 0) {
            //    this.Entries.pop();
            //}
        };
        this.sortingRequired = false;

        // intellisense helper
        this.Entries[0] = new Entry(0, 0, 0, 0);

        this.distance = function (courseID) {
            return Course.getDistance(courseID);
        };
        this.loadEntries = function (entries) {
            //var self = this,
            //    entry;
            this.Entries.length = 0;
            //while (this.Entries.length > 0) {
            //    this.Entries.pop();
            //}
            //$.each(entries, function () {
            entries.forEach(function(entry){
                // convert json list into list of entry objects
                //entry = new Entry(this.Number, this.Start, this.Finish, this.RiderID);
                this.Entries.push(new Entry(entry.Number, entry.Start, entry.Finish, entry.RiderID));
            },this);
        };
        this.getEntries = function () {
            return this.Entries;
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
                results = [],
                rider,
                rideTimeString,
                rideTime,
                stdTime,
                start, finish;

            // first do a table in finishing order

            this.Entries.forEach(function (entry) {
                pos += 1;
                entry.Position = pos;
                rider = Riders.riderFromID(entry.RiderID);
                stdTime = rider.vetStandardTime(this.distance());
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
                    results.push([entry.Position, entry.Number, rider.Name, ttApp.isMobile() ? Clubs.getAbbr(rider.ClubID) : Clubs.getName(rider.ClubID), rideTimeString, ttTime.timeStringVetStd(entry.VetOnStd)]);
                }
            }, this);

            ttApp.changePage("resultpage");
            if (ttApp.isMobile()) {
                $('#btnEmailResult').hide();
            }
            if (login.checkRole() === false) {
                $('#btnEmailResult').hide();
            }
            //title = Clubs.getName(this.ClubID) + " " + ttTime.dateTimeString(this.Time) + " " + Course.getName(this.CourseID);
            $('#resultsTitle').text(this.details());

            var table = new TTTable('#results', "Select Rider:", results, ttApp.tableHeight(), null, true);
            table.tableDefs.filter = false;
            table.tableDefs.columns = [{ "sTitle": "" },
                  { "sTitle": "no:" },
                  { "sTitle": "name" },
                  { "sTitle": "club" },
                  { "sTitle": "time" },
                  { "sTitle": "vet+" }];
            table.show();
            //ttTable.resultsTableRiders(results);
            $('#results tbody tr').on('click', function () {
                var nTds, name, rider;
                nTds = $('td', this);
                name = $(nTds[2]).text();
                rider = Riders.riderFromName(name);

                ttApp.changePage("riderDetailsPage");

                rider.displayRider(true);
            });
            // now do a summary table in clubs order

            results = [];
            this.Entries.forEach(function(entry){
                rider = Riders.riderFromID(entry.RiderID);
                stdTime = rider.vetStandardTime(this.distance());
                start = entry.Start;
                finish = entry.Finish;
                if (stdTime > 0) {
                    entry.VetOnStd = finish - start - stdTime;
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
                    results.push([Clubs.getAbbr(rider.ClubID), entry.Number, rider.Name, rideTimeString, ttTime.timeStringVetStd(entry.VetOnStd)]);
                }
            },this);

            //TTTable.resultsTableSummary(results, this.details());
            table = new TTTable("#extraResults", "", results, 300, null, true);
            table.tableDefs.columns = [
                      { "title": "no:" },
                      { "title": "name" },
                      { "title": "club" },
                      { "title": "time" },
                      { "title": "vet+" }];
            table.show();
        };
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
                //$.each(this.Entries, function () {
                this.Entries.forEach(function(entry){
                    rider = Riders.riderFromID(entry.RiderID);
                    if (rider === null) {
                        rider = new TTRider(entry.RiderID, "Rider not found", 0, 1, 0, "");
                    }
                    entrydata.push([entry.Number, rider.Name, Clubs.getAbbr(rider.ClubID), ttTime.timeString(entry.Start)]);
                });
                table = new TTTable('#entries', "Find entry", entrydata, ttApp.tableHeight(), null, true);
                table.tableDefs.columns =    [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Start" }];
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
                    entrydata.push([entry.Number, rider.Name, cat, stdTimeStr, target, Clubs.getName(rider.ClubID), ttTime.timeString(entry.Start)]);
                },this);
                table = new TTTable('#entries', "Find entry", entrydata, ttApp.tableHeight(), null, true);
                table.tableDefs.columns = [{ "title": "#" }, { "title": "Name" }, { "title": "Cat" }, { "title": "VetStd" }, { "title": "Target" }, { "title": "Club" }, { "title": "Start" }];
            }
            table.show();
            // *********** ToDo: allow deletion of entries but only if event hasn't happened
            $('#entries tbody tr').on('click', function () {
                var nTds = $('td', this),
                    name = $(nTds[1]).text();
                ttApp.changePage("riderDetailsPage");

                rider = Riders.riderFromName(name);
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
            table = new TTTable('#times', "Find entry", entrydata, ttApp.tableHeight() - 100, null,false);
            table.tableDefs.columns = [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Time" }];
            table.show();
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
                    rtime = $(nTds[3]).text();
                updatingEntry = parseInt($(nTds[0]).text(), 10);

                $('#riderTime').val(rtime);
                $('#riderTimeLabel').text(name);
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

            //$.each(this.Entries, function () {
            this.Entries.every(function(entry){
                if (updatingEntry === entry.Number) {
                    entry.Finish = endTime;
                    this.updateEventTimes();
                    return false; // break
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
                    }, true);
                }, true);
            }
            else {
                TTData.json("SaveEvent", "POST", this, function (response) {
                    popup.alert(response);
                }, true);
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
            $("#finish")[0].play();
            ttApp.changePage("onTheDay");
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
    };
    return event;
}(jQuery));