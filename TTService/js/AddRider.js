﻿/// <reference path="~\js\addClub.js" />
/// <reference path="~\js\rider.js" />
/// <reference path="~\js\timesdates.js" />

/*global $,popup,TTRider,Clubs,myTable,currentEvent,ttTime*/

var Riders = (function ($) {
    "use strict";

    var riders = {},
        list = [],
        riderBeforeChange,
        ridersChanged,
        newRider,
        riderTableSettings = null,
        editRider = null;



    // to be used when a new rider is required (no riders found from search)
    function noRidersFound(nRow, ssData, iStart, iEnd, aiDisplay)
    {
        if (iStart === iEnd) {
            $("#btnNewRider").show();
            $("#btnAddRider").hide();
            //$("#riderClubTable").prop("disabled", true);
            //$("#slider-age").prop("disabled", true);
            //$("#checkLady").prop("disabled", true);
        }
        else {
            $("#btnNewRider").hide();
            $("#btnAddRider").show();
            //$("#riderClubTable").prop("disabled", false);
            //$("#slider-age").prop("disabled", false);
            //$("#checkLady").prop("disabled", false);
        }
        //$("#slider-age").slider("refresh");
        //$('input:checkbox').checkboxradio('refresh');
    }

    function chooseRider(addToEvent)
    {
        var table,names = [];
        $.each(list, function (index, rider) {
            if (rider.Age === null || rider.Name === "" || rider.ClubID === 0) {
                return true; // continue;
            }
            if (addToEvent === false || rider.inEvent() === 0) {
                names.push([rider.Name, Clubs.getAbbr(rider.getClubID())]);
            }
        });
        table = myTable('#newRider', { "sSearch": "Select Rider:", "sZeroRecords": "" }, names, 200, [null, null], noRidersFound);
    
        $('#riderClubTable').html("");
        $('#btnNewClub').hide();

        riderTableSettings = table.settings();
        $('#newRider tbody tr').on('click', function ()
        {
            var newName,
                nTds = $('td', this);

            newName = $(nTds[0]).text();
            $('#newRiderTable').html(newName);
            // enable getting back the table (to choose a different rider) by double-clicking the chosen name
            $('#newRiderTable').dblclick(function () {  chooseRider(); });
            // place other details in form  from existing rider
            $.each(list, function (index, rider) {
                if (rider.Name === newName) {
                    // save details so we can see if they have been changed

                    var age = rider.getAge(),
                        cat = rider.getCategory(),
                        id = rider.getID(),
                        name = rider.getName(),
                        clubID = rider.getClubID(),
                        best25 = rider.getBest25(),
                        email = rider.getEmail();

                    riderBeforeChange = new TTRider(id, name, age, cat, clubID, email, best25);
                    Clubs.chooseRiderClub(clubID);

                    if (rider.hasBest25()) {
                        $("#riderRideTime").val(ttTime.timeString(best25 * 1000));
                    }
                    $("#riderAge").val(age);
                    $("#riderEmail").val(email);
                    if (rider.isLady()) {
                        $("#checkLady").prop("checked", true);
                    }

                    $("#checkIn").prop("checked", true);
                    $('input:checkbox').checkboxradio('refresh');
                    newRider = rider;
                    return false; //break;
                }
            });
        });
    }

    function updateRiderDetails() {
        newRider.ID = riderBeforeChange.ID;
        newRider.changed = true;
        var i,oldRider;
        for (i = 0; i < list.length; i++) {
            oldRider = list[i];
            if (oldRider.ID === newRider.ID) {
                list[i]= newRider;
                break;
            }
            ridersChanged = true;
        }
    }
    
    function addRider(addToEvent) {
        if(list.length < 2) {
            popup.alert("No riders loaded, cannot autocomplete");
            return;
        }
        if (checkRole() === false) {
            return;
        }

        newRider = null;
        riderBeforeChange = null;

        ChangePage("addRiderPage");
        if (addToEvent && currentEvent.ID > 0) {
            $("#addRiderTitle").text(editRider === null ? "Add rider to event" : "Edit rider");
            $("#checkIn").prop("checked", true);
            //$("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
        }
            //else
            //    $("#addRiderHelp").text("Event aleady held: add rider's actual time");

        if (addToEvent === false || currentEvent.ID === 0 || currentEvent.PastEvent()) {
            $("#checkIn").prop("disabled", true);
    //        $("#lblRideTime").hide();
    //       $("#riderRideTime").hide();
        }
        else {
            $("#checkIn").prop("disabled", false);
    //       $("#lblRideTime").show();
    //       $("#riderRideTime").show();
        }
        // set default values for new rider 
        var startNumber = currentEvent.Entries.length +1,
            age = 10,
            email = "",
            thistime,
            entry;

        if (editRider !== null) {
            age = editRider.getAge();
            email = editRider.getEmail();
            thistime = editRider.getBest25() * 1000;
            entry = getEntryFromRiderID(editRider.getID());
            if (entry !== null) {
                startNumber = entry.Number;
                thistime = entry.Finish -entry.Start;
            }
            $("#riderRideTime").val(ttTime.timeString(thistime));
            $('#btnAddRider').text("Save Editing");
            $("#btnNewRider").hide();
            $("#btnNewClub").hide();
        }
        $("#checkLady").prop("checked", false);
        $('input:checkbox').checkboxradio('refresh');

        if (addToEvent)
        {
            $("#riderStartNumber").show();
            $("#lblRiderStart").show();
        }
        else
        {
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
            newRider = editRider;
            $('#newRiderTable').html(newRider.Name);
        }

        // adding result details to an old event
        $("#riderRideTime").show();

        $("#riderRideTime").timepicker({
            showSecond: true,
                timeFormat: 'HH:mm:ss',
                controlType: 'select',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        });

        if (currentEvent.PastEvent()) {
            $("#lblRideTime").text("Result time:");
            //        $("#addRiderHelp").text("Event aleady held: add rider's actual time");
        }
        else {
            $("#lblRideTime").text("Recent 10 or 25 time:");
            //        $("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
        }
    }
    

    function TimePopup(result) {
        $('#riderRideTime').val(result);
    }

    $('#btnNewRider').click(function () {

        var existingClub = 0,
        newName,
        newNameParts,
        entry,
        i,
        rider,
        confirmation;

        if (newRider === null) {
            //var newName = riderTableSettings.oPreviousSearch.sSearch;
            newName = riderTableSettings.search();
            newNameParts = newName.split(' ');
            newName = newNameParts[0].capitalize();
            if (newNameParts[1] !== null) {
                newName += (" " + newNameParts[1].capitalize());
            }

            for (i=0; i < currentEvent.Entries.length; i++) {
                entry = currentEvent.Entries[i];
                rider =Riders.riderFromID(entry.RiderID);
                if (rider !== null && rider.getName() === newName) {
                    existingClub = rider.ClubID;
                    break;
                }
            }
            confirmation = newName + ' : enter new rider?';
            if (existingClub>0) {
                confirmation = newName + " (" + Clubs.getName(existingClub) + ") is already in this event, is this the same name in a different club?";
            }
            popup.Confirm(confirmation,
                function () {
                    // re-enable other controls
                    $("#btnAddRider").show();
                    $("#riderClubTable").prop("disabled", false);
                    $("#slider-age").prop("disabled", false);
                    $("#checkLady").prop("disabled", false);
                    $("#btnNewRider").hide();
                    newRider = new TTRider(0, newName, 0, 0, 0, "", 0);
                    // get rid of name selection list
                    $('#newRiderTable').html(newName);

                    Clubs.chooseRiderClub(0);
                    //newRider.newOne = true;
            }, null);
        }
    });


    $('#addEvRider').click(function () {
        addRider(true);
        });

    $('#editRider').click(function () {

        if (checkRole() === false) {
            return;
        }
        var rider, name = $('#name').text();
        rider = Riders.riderFromName(name);
        if (rider !== null) {
            editRider = rider;
            addRider.addRider(currentEvent.ID > 0);
        }
    });
        
    $('#btnNewRider').click(function () {
        var newR = true,
            in_event = false,
            startNumber,
            i,
            entry,
            rider,
            age = $("#riderAge").val(),
            currentTime,
            currentDate,
            startTime,
            endTime,
            rideTimeD,
            rideTimeS,
            bestTimeD,
            bestTimeS,
            timePopup,
            e;
    
        if (age < 12 && age !== 0) {
            popup.alert("Must enter a valid age (12 or above), or zero if age unknown");
            return;
        }
        if (newRider === null) {
            popup.alert("Error with rider...");
            return;
        }
        newRider.setAge(age);
        //newRider.Category = GetCategory(age);
        if (newRider.getClubID() === 0) {
            popup.alert("Must choose a club");
            return;
        }
        newRider.setEmail($("#riderEmail").val());
       
        if (riderBeforeChange !== null) {
            if (riderBeforeChange.getAge() !== newRider.getAge() ||
                riderBeforeChange.getClubID() !== newRider.getClubID() ||
                riderBeforeChange.getCategory() !== newRider.getCategory()) {
                // same name, details have been changed
                if (popup.confirm('Rider already in list. Update Details?')) {
                    updateRiderDetails();
                    //newRider.ID = riderBeforeChange.ID;
                    //newRider.changed = true;
                    //for (var i in ridersdata) {
                    //    var oldRider = ridersdata[i];
                    //    if (oldRider.ID == newRider.ID) {
                    //        ridersdata[i] = newRider;
                    //        break;
                    //    }
                    //    ridersChanged = true;
                    //}
                }
                else {
                    popup.alert("Rider not added or updated");
                    //history.back();
                    //return;
                }
            }
            else if ($("#checkIn").prop("checked")===false) {
                popup.alert("No changes for rider");
                //history.back();
                //return;
            }
        }
        else {
            //// this is a new rider, needs adding to list
             list.push(newRider);
            ridersChanged = true;
        }

        // if required, add to event list if not already there
        if ($("#checkIn").prop("checked")) {
            if (newRider.inEvent() === 0 || currentEvent.PastEvent()) {

                //var startTimeS = $('#riderStartTime').val();
                //var startTimeD = timeFromString(startTimeS);
                //var startTime = startTimeD.valueOf();
                if (currentEvent.PastEvent()) {
                    startNumber = $('#riderStartNumber').val();
                    if (startNumber === null || startNumber === "" || isNaN(startNumber)) {
                        popup.alert("Must set a starting number");
                        return;
                    }
                    // check that start number chosen hasn't already been used
                    for (i = 0; i < currentEvent.Entries.length; i++) {
                        entry = currentEvent.Entries[i];
                        if (entry.Number === startNumber && entry.RiderID !== newRider.ID) {
                            rider = Riders.riderFromID(entry.RiderID);
                            if (popup.confirm("Start number already used by " + rider.Name + ". Do you want to re-allocate that one?")) {
                                entry.Number = currentEvent.Entries.length + 1;
                                break;
                            }
                            // allow choosing a different number
                            return;
                        }
                    }
                }
                else {
                    startNumber = currentEvent.Entries.length + 1;
                }
                currentTime = new Date(currentEvent.Time);
                currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0, 0, 0, 0);
                startTime = currentEvent.Time + 1000 * 60 * startNumber;

                if (currentEvent.PastEvent()) {
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
                            timePopup = new Popup('Rider\'s time required');
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
                else {
                    endTime = ttTime.noTimeYet();
                    bestTimeS = $('#riderRideTime').val();
                    bestTimeD = ttTime.timeFromString(bestTimeS);
                    if (bestTimeD === null || isNaN(bestTimeD)) {
                        //ignore it
                    }
                    else {
                        newRider.Best25 = bestTimeD.valueOf()/1000;
                        // Best '25' time in seconds. Server will convert to '25' time from '10' time if necessary
                        if (riderBeforeChange !== null) {
                            if (riderBeforeChange.Best25 !== newRider.Best25) {
                                updateRiderDetails();
                            }
                        }
                    }
              
                }

                entry = new Entry(
            
                    // ToDo **** allow for more than one minute between starts
                    startNumber,
                    startTime,
                    endTime,
                    newRider.ID);
                if (editRider === null) {
                    currentEvent.Entries.push(e);
                }
                else {
                    $.each(currentEvent.Entries,function(index,e) {
                        if (e.RiderID === newRider.ID) {
                            e = entry;
                            return false;
                        }
                    })
                }
            }
            else {
                popup.alert("Rider already in event");
            }
            in_event = true;
        }
        //  now add another rider...but first remove last rider's times, if any
        $('#riderStartNumber').val("");
        $('#riderRideTime').val("");
        if (editRider === null) {
            AddRider(in_event);
        }
        else {
            ChangePage("riderDetailsPage");
            displayRider(newRider, in_event);
            editRider = null;
            // history.back();
        }
    });


    return {
        tempID: function () {
            var highest = 0;
            // find highest ID. This will probably NOT be the length of the riders array, since SQL will allocate higher IDs 
            for (var i in list) {
                var r = list[i];
                if (r.ID > highest) {
                    highest = r.ID;
                }
            }
            return highest + 1;
        },
        riderFromName: function(ridername)
        {
            for (var i in list) {
                var rider = list[i];
                if (ridername === rider.Name) {
                    return rider;
                }
            }
            return 0;
        },
        riderFromID: function(riderID)
        {
            for (var i in list) {
                var rider = list[i];
                if (riderID === rider.ID)
                    return rider;
            }
            return null;
        }
    }
})(jQuery)

