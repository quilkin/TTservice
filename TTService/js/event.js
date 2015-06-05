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
            while (this.Entries.length > 0) {
                this.Entries.pop();
            }
        };
        this.sortingRequired = false;

        // intellisense helper
        this.Entries[0] = new Entry(0, 0, 0, 0);

        this.distance = function (courseID) {
            return Course.getDistance(courseID);
        };
        this.loadEntries = function (entries) {
            var self = this,
                entry;
            while (this.Entries.length > 0) {
                this.Entries.pop();
            }
            $.each(entries, function () {
                // convert json list into list of entry objects
                entry = new Entry(this.Number, this.Start, this.Finish, this.RiderID);
                self.Entries.push(entry);
            });
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
            var entry = null;
            $.each(this.Entries, function () {
                if (this.RiderID === riderID) {
                    entry = this;
                    return false;
                }
            });
            return entry;
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

            var pos = 1,
                results = [],
                self = this,
                entry,
                index,
                rider,
                rideTimeString,
                rideTime,
                stdTime,
                start, finish;

            //$.each(this.Entries, function (index, entry) {
            for (index = 0; index < this.Entries.length; index += 1) {
                entry = this.Entries[index];
                pos += 1;
                entry.Position = pos;
                rider = Riders.riderFromID(entry.RiderID);
                //rider = new TTRider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email, r.Best25),
                stdTime = rider.vetStandardTime(self.distance());

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
                else if (finish >= ttTime.specialTimes()) {
                    return true;          //continue, don't add to list
                }
                rideTimeString = ttTime.timeStringH1(rideTime);
                results.push([entry.Position, entry.Number, rider.Name, ttApp.isMobile() ? Clubs.getAbbr(rider.ClubID) : Clubs.getName(rider.ClubID), rideTimeString, ttTime.timeStringVetStd(entry.VetOnStd)]);

            }

            ttApp.changePage("resultpage");
            if (ttApp.isMobile()) {
                $('#btnEmailResult').hide();
            }
            if (login.checkRole() === false) {
                $('#btnEmailResult').hide();
            }
            //title = Clubs.getName(this.ClubID) + " " + ttTime.dateTimeString(this.Time) + " " + Course.getName(this.CourseID);
            $('#resultsTitle').text(this.details());

            resultsTableRiders(results);

            results = [];
            $.each(this.Entries, function () {
                //entry.Position = pos++;
                rider = Riders.riderFromID(this.RiderID);
                // rider = new TTRider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email, r.Best25),
                stdTime = rider.vetStandardTime(self.distance());

                if (stdTime > 0) {
                    this.VetOnStd = this.Finish - this.Start - stdTime;
                }
                else {
                    this.VetOnStd = 0;
                }
                rideTime = this.Finish - this.Start;
                if (this.Finish / 1000 === ttTime.didNotStart() / 1000) {
                    rideTimeString = "DNS";
                    this.VetOnStd = 0;
                }
                else if (this.Finish / 1000 === ttTime.didNotFinish() / 1000) {
                    rideTimeString = "DNF";
                    this.VetOnStd = 0;
                }
                else if (this.Finish >= ttTime.specialTimes()) {
                    return true;          //continue, don't add to list
                }
                rideTimeString = ttTime.timeStringH1(rideTime);
                results.push([Clubs.getAbbr(rider.ClubID), this.Number, rider.Name, rideTimeString, ttTime.timeStringVetStd(this.VetOnStd)]);
            });
            //file = Clubs.getName(this.ClubID) + " " + ttTime.dateTimeString(this.Time) + " " + Course.getName(this.CourseID);
            resultsTableSummary(results, this.details());
        };
        this.displayEvent = function () {
            var rider,
                self,
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
                $.each(this.Entries, function () {
                    rider = Riders.riderFromID(this.RiderID);
                    if (rider === null) {
                        rider = new TTRider(this.RiderID, "Rider not found", 0, 1, 0, "");
                    }
                    entrydata.push([this.Number, rider.Name, Clubs.getAbbr(rider.ClubID), ttTime.timeString(this.Start)]);
                });
                myTable('#entries', { "search": "Find entry" }, entrydata, ttApp.tableHeight(), [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Start" }], null);
            }
            else {
                // more details
                self = this;
                $.each(this.Entries, function () {
                    rider = Riders.riderFromID(this.RiderID);

                    if (rider === null) {
                        rider = new TTRider(this.RiderID, "Rider not found", 0, 1, 0, "", 0);
                    }

                    target = "";
                    if (rider.hasBest25()) {
                        target = ttTime.timeStringH1(rider.Best25 * 1000);
                    }

                    cat = rider.catAbbr();
                    stdTime = rider.vetStandardTime(self.distance());
                    stdTimeStr = stdTime > 0 ? ttTime.timeStringH1(stdTime) : "";
                    entrydata.push([this.Number, rider.Name, cat, stdTimeStr, target, Clubs.getName(rider.ClubID), ttTime.timeString(this.Start)]);
                });
                myTable('#entries', { "search": "Find entry" }, entrydata, ttApp.tableHeight(), [{ "title": "#" }, { "title": "Name" }, { "title": "Cat" }, { "title": "VetStd" }, { "title": "Target" }, { "title": "Club" }, { "title": "Start" }], null);

            }

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

            $.each(this.Entries, function () {
                rider = Riders.riderFromID(this.RiderID);
                if (rider === null) {
                    rider = new TTRider(this.RiderID, "Rider not found", 0, 1, 0, "");
                }

                rideTime = this.Finish - this.Start;
                if (this.Finish / 1000 === ttTime.didNotStart() / 1000) {
                    rideTimeString = "DNS";
                }
                else if (this.Finish / 1000 === ttTime.didNotFinish() / 1000) {
                    rideTimeString = "DNF";
                }
                else if (this.Finish >= ttTime.specialTimes()) {
                    rideTimeString = "???";
                }
                else {
                    rideTimeString = ttTime.timeStringH1(rideTime);
                }
                entrydata.push([this.Number, rider.Name, Clubs.getAbbr(rider.ClubID), rideTimeString]);
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
                    rtime = $(nTds[3]).text();
                updatingEntry = parseInt($(nTds[0]).text(), 10);

                $('#riderTime').val(rtime);
                $('#riderTimeLabel').text(name);
            });
        };
        this.saveRiderTime = function () {
            var endTime = ttTime.noTimeYet(),
                startTime, rideTimeS, rideTimeD,
                self = this;

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

            $.each(this.Entries, function () {
                if (updatingEntry === this.Number) {
                    this.Finish = endTime;
                    self.updateEventTimes();
                    return false; // break
                }
            });
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
            if (this.sortingRequired) {
                TTData.json("SaveEvent", "POST", this, function () {
                    TTData.json('SeedEntries', "POST", this, function (entries) {
                        $.each(entries, function (index, e) {
                            self.Entries[index] = e;
                        });
                        popup.alert("Sorting done");
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
            $.each(this.Entries, function () {
                this.Start += timediff;
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