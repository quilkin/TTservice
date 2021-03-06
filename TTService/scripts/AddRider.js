﻿var Riders = (function ($) {
    "use strict";

    var list = [],
        table,
        newRider = null,
        riderBeforeChange = null,
        ridersChanged = 0,
        //riderTableSettings = null,
        editRider = null,
                // we will be uploading new riders.These will have a temporary ID 
        newRiders = [],
        changedRiders = [],
        eventToBeSaved = null;

    // intellisense helper
    list[0] = new TTRider(1,'',0);

    function getRiderData2() {
        TTData.json("GetClubs", "GET", 0, Clubs.parseJson);
        list.length = 0;
        TTData.json("GetRiders", "GET", 0, function (response) {
            response.forEach(function(r){
                // convert json list into list of rider objects
                list.push(new TTRider(r.ID, r.Name, r.DoB, r.Lady, r.ClubID, r.Email, r.Best25));
            });
        });
        TTData.json("GetCourses", "GET", 0, Course.parseJson);
        ridersChanged = false;
    }

    // to be used when a new rider is required (no riders found from search)
    function noRidersFound(nRow, ssData, iStart, iEnd, aiDisplay) {
        if (iStart === iEnd) {
            // check that rider isn't already in event
            var event = EventList.currentEvent(),
                //rider = riderTableSettings.search(),
                rider = table.getSettings().search(),
                entry = event.getEntryFromName(rider);
            if (entry !== null) {
                rider = Riders.riderFromID(entry.RiderID);
                $("#btnAlreadyIn").show();
                $("#btnAlreadyIn").text(rider.Name + " is already in event");

            }
            $("#btnNewRider").show();
            $("#btnAddRider").hide();
        }
        else {
            $("#btnAlreadyIn").hide();
            $("#btnNewRider").hide();
            $("#btnAddRider").show();

        }
    }

    function chooseRider(addToEvent) {
        var index, rider, names = [];
        for (index = 0; index < list.length; index++) {
            rider = list[index];
            if (rider.DoB === null || rider.Name === "" || rider.ClubID === 0) {
                return true; // continue;
            }
            if (addToEvent === false || rider.inEvent() === 0) {
                names.push([rider.ID, rider.Name, Clubs.getAbbr(rider.ClubID)]);
            }
        }

        $('#riderClubTable').html("");
        $('#btnNewClub').hide();

        table = new TTTable('#newRider',
            [   { "title": "" , "visible":false},
                { "title": "" },
                { "title": "" }    ],
            "Select Rider:", names, 200, noRidersFound, false);

        table.show(function (data) {
            // place other details in form  from existing rider
            var rider = fromID(data[0]);
            $('#newRiderTable').html(rider.Name);
            // enable getting back the table (to choose a different rider) by double-clicking the chosen name
            $('#newRiderTable').dblclick(function () { chooseRider(addToEvent); });

            // save details so we can see if they have been changed
            var dob = rider.DoB,
                lady = rider.Lady,
                id = rider.ID,
                name = rider.Name,
                clubID = rider.ClubID,
                best25 = rider.Best25,
                email = rider.Email,
                event;

            riderBeforeChange = new TTRider(id, name, dob, lady,clubID, email, best25);
            Clubs.chooseRiderClub(clubID);
            event = EventList.currentEvent();
                    
            if (event !== null && event.pastEvent() === false) {
                $("#dns1").hide();
                $("#dnf1").hide();
            }
            $("#lblRideTime").show();
            $("#riderRideTime").show();
                    
            if (event !== null && event.pastEvent()) {
                $("#lblRideTime").text("Result time:");
                //        $("#addRiderHelp").text("Event aleady held: add rider's actual time");
            }
            else {
                $("#lblRideTime").text("Recent 10 or 25 time:");
                //        $("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
            }
            if (rider.hasBest25()) {
                $("#riderRideTime").val(ttTime.timeString(best25 * 1000));
            }
            $("#riderAge").val(rider.age());
            $("#riderEmail").val(email);
            if (lady) {
                $("#checkLady").prop("checked", true);
            }

            $("#checkIn").prop("checked", true);
            $('input:checkbox').checkboxradio('refresh');
            newRider = rider;
        })
    }

    function updateRiderDetails() {
        newRider.ID = riderBeforeChange.ID;
        newRider.changed = true;
        var i, oldRider;
        for (i = 0; i < list.length; i++) {
            oldRider = list[i];
            if (oldRider.ID === newRider.ID) {
                list[i] = newRider;
                break;
            }
            ridersChanged = true;
        }
    }



    function addRider(addToEvent) {
        // set default values for new rider 
        var event = EventList.currentEvent(),
            startNumber,
            age = 10,
            clubID = 0,
            email = "",
            thistime,
            entry = null;
        
        //if (addToEvent &&  event.pastEvent()) {
        //    popup.alert("Cannot add rider to past event");
        //    return;
        //}
        if (addToEvent) {
            startNumber = event.nextAvailableEntry();
        }
        if (list.length < 2) {
            popup.alert("No riders loaded, cannot autocomplete");
            return;
        }
        if (login.checkRole() === false) {
            return;
        }

        newRider = null;
        riderBeforeChange = null;

        ttApp.changePage("addRiderPage");
        if (addToEvent && event !== null) {
            $("#addRiderTitle").text(editRider === null ? "Add rider to event" : "Edit rider");
            $("#checkIn").prop("checked", true);
            //$("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
        }
        else if (editRider !== null)
        {
            $("#addRiderTitle").text("Edit rider");
        }
        //else
        //    $("#addRiderHelp").text("Event aleady held: add rider's actual time");

        if (addToEvent === false || event === null || event.pastEvent()) {
            $("#checkIn").prop("disabled", true);

        }
        else {
            $("#checkIn").prop("disabled", false);

        }
        if (event !== null && event.pastEvent()) {
                   $("#lblRideTime").show();
                   $("#riderRideTime").show();
                   $("#dns1").show();
                   $("#dnf1").show();
        }
        else {
                    $("#lblRideTime").hide();
                    $("#riderRideTime").hide();
                    $("#dns1").hide();
                    $("#dnf1").hide();
        }

        if (editRider !== null) {
            age = editRider.age();
            clubID = editRider.ClubID;
            email = editRider.Email;
            thistime = editRider.Best25 * 1000;
            if (addToEvent) {
                entry = event.getEntryFromRiderID(editRider.ID);
            }
            if (entry !== null) {
                startNumber = entry.Number;
                thistime = entry.Finish - entry.Start;
            }
            $("#riderRideTime").val(ttTime.timeString(thistime));
            //$("#riderEditClub").val(Clubs.getName(clubID));
            $('#btnAddRider').text("Save Editing");
            $("#btnNewRider").hide();
            $("#btnAlreadyIn").hide();
            $("#btnNewClub").hide();
        }
        $("#checkLady").prop("checked", false);
        $('input:checkbox').checkboxradio('refresh');

        if (addToEvent) {
            $("#riderStartNumber").show();
            $("#lblRiderStart").show();
        }
        else {
            $("#riderStartNumber").hide();
            $("#lblRiderStart").hide();
        }

        $("#riderAge").val(age);

        $("#riderEmail").val(email);
        $("#riderStartNumber").val(startNumber);

        if (editRider === null) {
            chooseRider(addToEvent);
        }
        else {
            riderBeforeChange = editRider;
            newRider = new TTRider(editRider.ID, editRider.Name, editRider.DoB, editRider.Lady, editRider.ClubID, editRider.Email, editRider.Best25); 
            $('#newRiderTable').html(newRider.Name);
            $('#riderClubTable').html(Clubs.getName(editRider.ClubID));
        }

        if (addToEvent) {
            $("#riderRideTime").show();
            $("#riderRideTime").timepicker({
                showSecond: true,
                timeFormat: 'HH:mm:ss',
                controlType: 'select',
                stepHour: 1,
                stepMinute: 1,
                stepSecond: 1,
                showButtonPanel: false
            });
        }
        else {

            // enable changing the club by double-clicking the club name
            $('#riderClubTable').dblclick(function () {
                Clubs.clubTable(true);
            });
        }
        if (event !== null && event.pastEvent()) {
            $("#lblRideTime").text("Result time:");
            //        $("#addRiderHelp").text("Event aleady held: add rider's actual time");
        }
        else {
            $("#lblRideTime").text("Recent 10 or 25 time:");
            //        $("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
        }
    }


    function fromID(riderID) {
        var i, rider;
        for (i = 0; i < list.length; i++) {
            rider = list[i];
            if (riderID === rider.ID) {
                return rider;
            }
        }
        return null;
    }

    $('#displayRiderList').click(function () {
        var table, best25string,
            riderArray = [],
            rider;

        if (list === null) {
            popup.alert("No riders loaded!");
            return;
        }

        list.forEach(function(rider){
            var cat = rider.catAbbr();
            if (rider.inEvent()) {
                cat += " *";
            }
            best25string = "";
            if (rider.hasBest25()) {
                best25string = ttTime.timeStringH1(rider.Best25 * 1000);
            }
            riderArray.push([rider.ID, rider.Name, Clubs.getAbbr(rider.ClubID), cat, best25string]);
            //riderArray.push([rider.Name, Clubs.getAbbr(rider.ClubID), cat, best25string]);

        });

        ttApp.changePage("ridersPage");
        table = new TTTable('#riders',
            [   { "title": "ID", "width": "1%", "visible":false },
                { "title": "Name" },
                { "title": "Club", "width": "20%" },
                { "title": "Cat.", "width": "10%" },
                { "title": "Best 25" }    ],
            "Select Rider:", riderArray, ttApp.tableHeight(), noRidersFound, true);
        table.tableDefs.order = [1, 'asc'];
        table.show(function (data) {
            ttApp.changePage("riderDetailsPage");
            rider = fromID(data[0]);
            rider.displayRider(false);
        });
        
    });

    function TimePopup(result) {
        $('#riderRideTime').val(result);
    }

    function capitalize(string) {
        // capitalise initial letter
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function addNextRider(in_event) {
        //  now add another rider...but first remove last rider's times, if any
        $('#riderStartNumber').val("");
        $('#riderRideTime').val("");
        if (editRider === null) {
            addRider(in_event);
        }
        else {
            ttApp.changePage("riderDetailsPage");
            newRider.displayRider(in_event);
            editRider = null;
            // history.back();
        }
    }

    $('#btnAlreadyIn').click(function () {
        //abort current choice and start again
        chooseRider(true);
    });

    $('#btnNewRider').click(function () {

        var existingClub = 0,
        newName,
        newNameParts,
        entry,
        event = EventList.currentEvent(),
        i,
        rider,
        confirmation;



        if (newRider === null) {
            //newName = riderTableSettings.oPreviousSearch.sSearch;
            //newName = riderTableSettings.search();
            newName = table.getSettings().search();
            newNameParts = newName.split(' ');
            newName = capitalize(newNameParts[0]);
            if (newNameParts[1] !== null && newNameParts[1] !== undefined) {
                newName += (" " + capitalize(newNameParts[1]));
            }

            for (i = 0; i < event.getEntries().length; i++) {
                entry = event.getEntries()[i];
                rider = fromID(entry.RiderID);
                if (rider !== null && rider.Name === newName) {
                    existingClub = rider.ClubID;
                    break;
                }
            }
            confirmation = newName + ' : enter new rider?';
            if (existingClub > 0) {
                confirmation = newName + " (" + Clubs.getName(existingClub) + ") is already in this event, is this the same name in a different club?";
            }
            popup.confirm(confirmation,
                function () {
                    // re-enable other controls
                    $("#btnAddRider").show();
                    $("#riderClubTable").prop("disabled", false);
                   // $("#slider-age").prop("disabled", false);
                    $("#checkLady").prop("disabled", false);
                    $("#btnNewRider").hide();
                    newRider = new TTRider(0, newName, 0, 0, 0, "", 0);
                    // get rid of name selection list
                    $('#newRiderTable').html(newName);

                    Clubs.chooseRiderClub(0);
                }, null);
        }
    });


    $('#addEvRider').click(function () {
        addRider(true);
    });

    $('#editRider').click(function () {

        if (login.checkRole() === false) {
            return;
        }
        var rider,
            name = $('#name').text(),
            event = EventList.currentEvent(),
            riderID = parseInt($('#riderID').text(), 10);
        rider = fromID(riderID);
        if (rider !== null) {
            editRider = rider;
            addRider(event !== null && event.ID > 0);
        }
    });
    $('#dns1').click(function () {
        $('#riderRideTime').val('DNS');
    });

    $('#dnf1').click(function () {
        $('#riderRideTime').val('DNF');
    });

    function addToEventPart2(startNumber) {
        var  entry,
            event = EventList.currentEvent(),
            startTime,
            endTime,
            rideTimeD,
            rideTimeS,
            bestTimeD,
            bestTimeS,
            timePopup;

        startTime = event.getTime() + 1000 * 60 * startNumber;
        if (event.pastEvent()) {
            rideTimeS = $('#riderRideTime').val();
            if ($('#riderRideTime').val() === 'DNS') {
                endTime = ttTime.didNotStart();
            }
            else if ($('#riderRideTime').val() === 'DNF') {
                endTime = ttTime.didNotFinish();
            }
            else {

                rideTimeD = ttTime.timeFromString(rideTimeS);
                endTime = startTime + rideTimeD.valueOf();

                if (endTime === null || isNaN(endTime)) {
                    timePopup = new popup('Rider\'s time required');
                    timePopup.addMenuItem('Did not Start', TimePopup, 'DNS');
                    timePopup.addMenuItem('Did not Finish', TimePopup, 'DNF');
                    timePopup.addMenuItem('Enter a time');
                    timePopup.open();
                    return;
                }
            }
            if (endTime === null || isNaN(endTime)) {
                // not yet finished or time unknown
                endTime = ttTime.noTimeYet();
            }

        }
        else {  // future event
            endTime = ttTime.noTimeYet();
            bestTimeS = $('#riderRideTime').val();
            bestTimeD = ttTime.timeFromString(bestTimeS);
            if (bestTimeD === null || isNaN(bestTimeD)) {
                //ignore it
            }
            else {
                newRider.Best25 = bestTimeD.valueOf() / 1000;
                // Best '25' time in seconds. Server will convert to '25' time from '10' time if necessary
                if (riderBeforeChange !== null) {
                    if (riderBeforeChange.Best25 !== newRider.Best25) {
                        updateRiderDetails();
                    }
                }
            }

        }

        entry = new TTEntry(
            startNumber,
            startTime,
            endTime,
            newRider.ID);
        if (editRider === null) {
            event.getEntries().push(entry);
        }
        else {
            event.getEntries().forEach(function (e) {
                if (e.RiderID === newRider.ID) {
                    e = entry;
                    return false;
                }
            });
        }
        addNextRider(true);
    }


    function addToEvent(event) {

        var startNumber,
            in_event = false,
            i,
            entry,
            rider;


        // if required, add to event list if not already there
        if ($("#checkIn").prop("checked")) {
            if (newRider.inEvent() === 0 || event.pastEvent()) {

                startNumber = parseInt($('#riderStartNumber').val(), 10);
                if (startNumber === null || startNumber === "" || isNaN(startNumber)) {
                    popup.alert("Must set a starting number");
                    return;
                }
                // check that start number chosen hasn't already been used
                var nextAvailable, startNumberOK = true;
                for (i = 0; i < event.getEntries().length; i++) {
                    entry = event.getEntries()[i];
                    if (entry.Number === startNumber && entry.RiderID !== newRider.ID) {
                        startNumberOK = false;
                        rider = fromID(entry.RiderID);
                        nextAvailable = event.nextAvailableEntry();
                        popup.confirm("Start number already used by " + rider.Name + ". Do you want to re-allocate that one?",
                            function () {
                                // yes, allocate next available number to existing entry
                                entry.Number = nextAvailable;
                                addToEventPart2(startNumber);
                            },
                            function () {
                                // no, allocate next available number to this one
                                startNumber = nextAvailable;
                                addToEventPart2(startNumber);
                            });
                        break;
                    }
                }
                if (startNumberOK) {
                    addToEventPart2(startNumber);
                }


                else {
                    popup.alert("Rider already in event");
                    addNextRider(in_event);
                }
                in_event = true;
            }
        }
    }

    function prepareToAdd(event) {
        if (riderBeforeChange !== null) {
            var dobDiff = Math.abs(riderBeforeChange.DoB - newRider.DoB) / 31536000000;
            if (dobDiff > 0.5 || riderBeforeChange.ClubID !== newRider.ClubID) {
                // same name, details have been changed
                popup.confirm('Rider already in list. Update Details?',
                    function () {
                        updateRiderDetails();
                        if (event === null || event.ID === 0) {
                            ttApp.changePage("riderDetailsPage");
                            newRider.displayRider(false);
                        }
                        addToEvent(event);
                    },

                    function () {
                        popup.alert("Rider not added or updated");
                    }
                );
            }
            else if ($("#checkIn").prop("checked") === false) {
                popup.alert("No changes for rider");
            }
            else {
                addToEvent(event);
            }
        }
        else {
            //// this is a new rider, needs adding to list
            list.push(newRider);
            ridersChanged = true;
            addToEvent(event);
        }
    }

    $('#btnAddRider').click(function () {
        var event = EventList.currentEvent(),
           agestring,
           age;

        if ($("#checkLady").prop("checked")) {
            newRider.Lady = true;
        }
        if (newRider.ClubID === 0) {
            popup.alert("Must choose a club");
            return;
        }
        newRider.Email = $("#riderEmail").val();

        //riderAge might be entered as DofB.

        agestring = $("#riderAge").val();
        if (agestring.length > 2)
        {
            var dob, date, month, year, question;
            dob = agestring.split('/');
            date = parseInt(dob[0]);
            month = parseInt(dob[1]-1);
            year = parseInt(dob[2]);
            dob = new Date(year, month, date);
            question = 'Date of birth: ' + dob.toDateString() + ' OK?',
            popup.confirm(question,
                function () {
                    newRider.DoB = dob;
                    prepareToAdd(event);
                },
                function () {
                    popup.alert('Invalid date');
                    return;
                }
            );
        }

        else
        {
            age = parseInt($("#riderAge").val(), 10);
       
            if (age < 12 && age !== 0) {
                popup.alert("Must enter a valid age (12 or above), or zero if age unknown");
                return;
            }
            if (newRider === null) {
                popup.alert("Error with rider...");
                return;
            }
            
            newRider.setDoB(age);
            prepareToAdd(event);
        }
      
 
    });

    return {
        getRiderData: function(){
                if (ridersChanged) {
                    popup.confirm('This will remove changes to any riders you have added or updated - are you sure?',
                    getRiderData2,
                    null);
                }
            getRiderData2();
        },
        saveRiderData: function(event) {
            if (login.checkRole() === false) {
                return;
            }
            eventToBeSaved = event;
            var message = (event!==null) ? "Save event and rider updates" : "Save new & changed riders";

            if (ridersChanged === false && event === null) {
                    // nothing to do
                popup.alert('No riders changed');
                return;
            }
            popup.confirm(message + ' to database - are you sure?', Clubs.uploadNewClubs, null);

        },
        saveNewRiders: function() {
            // upload the new riders.These will have a temporary ID  when uploaded, but post will return first new permanent ID
            list.forEach(function(rider){
                if (rider.tempID()) {
                    newRiders.push(rider);
                }
            });
            if (newRiders.length > 0) {
                TTData.json("SaveNewRiders", "POST", newRiders, [Riders.newRidersResponse, Riders.saveChangedRiders]);
            }
            else {
                Riders.saveChangedRiders();
            }
        },
        newRidersResponse: function(response) {
            var newID, index;
            for (index=0; index < response.length; index+=1) {
                newID = response[index].ID;
                // add new IDs to existing riders
                list.forEach(function (rider) {
                    if (rider !== undefined && rider.ID < 0) {
                        // this was a temp ID, replace it
                        // replace in the event list first, if there is an event to be saved
                        if (eventToBeSaved !== null) {
                            var eventEntries = eventToBeSaved.Entries;
                            eventEntries.forEach(function (entry) {
                                if (entry !== undefined && entry.RiderID === rider.ID) {
                                    // this was a temp ID, replace it
                                    entry.RiderID = newID;
                                }
                            });
                        }
                        // and in the main list
                        rider.ID = newID;
                    }
                });

            }
            popup.alert(response.length + " riders uploaded OK");
        },
        saveChangedRiders: function() {
            // now upload changed riders
            
            list.forEach(function (rider) {
                if (rider.changed) {
                    changedRiders.push(rider);
                    rider.changed = false;
                }
            });
            if (changedRiders.length > 0) {
                //changedRiders.forEach(function (rider) {
                //    rider.DoB = new Date(rider.DoB).toJSON();
                //})
                //TTData.json("SaveChangedRiders", "POST", changedRiders,
                //    [function (response) { popup.alert(response); },
                //        eventToBeSaved.saveEvent],
                //           true);
                TTData.json("SaveChangedRiders", "POST", changedRiders,
                    function (response) { popup.alert(response); }       );  // ToDo:  why won't this work any more by putting saveEvent() into callback from SaveChangedRiders? 
                                    //    it used to work - nothing appears to have changed!!!
                //eventToBeSaved.saveEvent();
            }
            //else {
                if (eventToBeSaved !== null) {
                    eventToBeSaved.saveEvent();
                }
            //}
        },
        updateClubIDs: function(oldID, newID) {
            //$.each(list, function (index, rider) {
            list.forEach(function (rider) {
                if (rider.ClubID === oldID) {
                    rider.ClubID= newID;
                }
            });
        },
        getNewRider: function () {
            return newRider;
        },
        tempID: function () {
            // must create a temporary (negative) ID
            // This will be replaced with a permanemt ID later, when there is communication with the DB
            var highest = 0, posID, i, rider;
            for (i = 0; i < list.length; i+=1) {
                rider = list[i];
                if (rider !== undefined) {
                    posID = rider.ID > 0 ? rider.ID : -rider.ID;
                    if (posID > highest) {
                        highest = posID;
                    }
                }
            }
            return -(highest + 1);
        },

        riderFromID: function (riderID) {
            return fromID(riderID);
        }


    };


}(jQuery));

