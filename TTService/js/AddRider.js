/// <reference path="~\js\addClub.js" />
/// <reference path="~\js\rider.js" />
/// <reference path="~\js\timesdates.js" />
/// <reference path="~\js\popups.js" />

/*global $,popup,TTRider,Clubs,myTable,currentEvent,TTData,ttTime*/

var Riders = (function ($) {
    "use strict";

    var Riders = {},
        list = [],
        riderBeforeChange,
        ridersChanged,
        newRider,
        riderTableSettings = null,
        ridersLoaded = false,  // use to save loaded length to check if any have been added
        editRider = null;




    function getRiderData2() {
        TTData.json("GetClubs", "GET", 0, Clubs.parseJson, true);
        TTData.json("GetRiders", "GET", 0, function (response) { list = response; }, true);
        TTData.json("GetCourses", "GET", 0, Course.parseJson, true);
        ridersChanged = false;
    };

    // to be used when a new rider is required (no riders found from search)
    function noRidersFound(nRow, ssData, iStart, iEnd, aiDisplay) {
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

    function chooseRider(addToEvent) {
        var table, names = [];
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
        $('#newRider tbody tr').on('click', function () {
            var newName,
                nTds = $('td', this);

            newName = $(nTds[0]).text();
            $('#newRiderTable').html(newName);
            // enable getting back the table (to choose a different rider) by double-clicking the chosen name
            $('#newRiderTable').dblclick(function () { chooseRider(); });
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
        if (list.length < 2) {
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

        if (addToEvent === false || currentEvent.ID === 0 || currentEvent.pastEvent()) {
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
        var startNumber = currentEvent.Entries.length + 1,
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
                thistime = entry.Finish - entry.Start;
            }
            $("#riderRideTime").val(ttTime.timeString(thistime));
            $('#btnAddRider').text("Save Editing");
            $("#btnNewRider").hide();
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

        if (currentEvent.pastEvent()) {
            $("#lblRideTime").text("Result time:");
            //        $("#addRiderHelp").text("Event aleady held: add rider's actual time");
        }
        else {
            $("#lblRideTime").text("Recent 10 or 25 time:");
            //        $("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
        }
    }

    function ridersResponse(response) {
        var newID, count;
        if (response > 0) {
            newID = response;
            // add new IDs to existing riders
            $.each(list, function (index, rider) {
                if (rider.tempID) {
                    rider.ID = newID++;
                    rider.tempID = false;
                }
            });
            count = newID - response;
            popup.alert(count + " riders uploaded OK");
        }
        else {
            popup.alert("! No riders uploaded");
        }
    }


    $('#displayRiderList').click(function () {
        var table, best25string, cat,
            riderArray = [],
            riderID,
            nTds,
            rider;

        if (list === null) {
            popup.alert("No riders loaded!");
            return;
        }

        $.each(list, function (index, rider) {
            cat = rider.catAbbr();
            if (rider.inEvent()) {
                cat += " *";
            }
            best25string = "";
            if (rider.hasBest25()) {
                best25string = ttTime.timeStringH1(rider.getBest25() * 1000);
            }
            riderArray.push([rider.getID(), rider.getName(), Clubs.getAbbr(rider.getClubID()), rider.getCategory(), best25string]);
        });

        ChangePage("ridersPage");

        table = myTable('#riders', { "sSearch": "Select Rider:" }, riderArray, tableHeight, [{ "sTitle": "ID" }, { "sTitle": "Name" }, { "sTitle": "Club" }, { "sTitle": "Cat." }, { "sTitle": "Best 25" }], null);
        table.order([[1, 'asc'], [0, 'asc']]);
        $('#riders tbody tr').on('click', function () {
            nTds = $('td', this);
            riderID = $(nTds[0]).text();

            ChangePage("riderDetailsPage");
            rider = Riders.riderFromID(riderID);
            rider.displayRider(false);
        });
    });

    function TimePopup(result) {
        $('#riderRideTime').val(result);
    };

    function capitalize(string) {
        // capitalise initial letter
        return string.charAt(0).toUpperCase() + this.slice(1);
    };

    
    function saveRiderData2() {

        // we will be uploading new riders.These will have a temporary ID 
        var newRiders = [];


        $.each(list, function (index, rider) {
            if (rider.tempID)
                newRiders.push(rider);
        });
        // but first upload new clubs.These will have a temporary ID  when uploaded, but post will return first new permanent ID
        // we will need the new club IDs for the new riders
        Clubs.uploadNewClubs();

        // now upload the new riders.These will have a temporary ID  when uploaded, but post will return first new permanent ID
        var ridersJson, clubsJson, thisurl;
        if (newRiders.length > 0) {
            myJson("SaveNewRiders", "POST", newRiders, ridersResponse, true);
        }
        // now upload changed riders
        var changedRiders = new Array();
        $.each(list, function (index, rider) {
            if (rider.changed)
                changedRiders.push(rider);
        });
        if (changedRiders.length > 0) {
            myJson("SaveChangedRiders", "POST", changedRiders, function (response) { popup.alert(response); }, true);
        }
    };
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
            newName = capitalize(newNameParts[0]);
            if (newNameParts[1] !== null) {
                newName += (" " + capitalize(newNameParts[1]));
            }

            for (i = 0; i < currentEvent.Entries.length; i++) {
                entry = currentEvent.Entries[i];
                rider = Riders.riderFromID(entry.RiderID);
                if (rider !== null && rider.getName() === newName) {
                    existingClub = rider.ClubID;
                    break;
                }
            }
            confirmation = newName + ' : enter new rider?';
            if (existingClub > 0) {
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
        var in_event = false,
            startNumber,
            i,
            entry,
            rider,
            age = $("#riderAge").val(),
            currentTime,
   //         currentDate,
            startTime,
            endTime,
            rideTimeD,
            rideTimeS,
            bestTimeD,
            bestTimeS,
            timePopup;


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
            else if ($("#checkIn").prop("checked") === false) {
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
            if (newRider.inEvent() === 0 || currentEvent.pastEvent()) {

                //var startTimeS = $('#riderStartTime').val();
                //var startTimeD = timeFromString(startTimeS);
                //var startTime = startTimeD.valueOf();
                if (currentEvent.pastEvent()) {
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
                //currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0, 0, 0, 0);
                startTime = currentEvent.Time + 1000 * 60 * startNumber;

                if (currentEvent.pastEvent()) {
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
                else {
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

                entry = new Entry(

                    // ToDo **** allow for more than one minute between starts
                    startNumber,
                    startTime,
                    endTime,
                    newRider.ID);
                if (editRider === null) {
                    currentEvent.Entries.push(entry);
                }
                else {
                    $.each(currentEvent.Entries, function (index, e) {
                        if (e.RiderID === newRider.ID) {
                            e = entry;
                            return false;
                        }
                    });
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
            addRider(in_event);
        }
        else {
            ChangePage("riderDetailsPage");
            newRider.displayRider(in_event);
            editRider = null;
            // history.back();
        }
    });

        
    Riders.saveRiderData = function(event) {
        if (checkRole() === false) {
            return;
        }

        var message = event ? "Save event and rider updates" : "Save new & changed riders";
        if (ridersLoaded) {

            if (ridersChanged == false)
            {
                if (!event)
                    popup.alert('No riders changed');
                return;
            }
            else
            {
                popup.Confirm(message + ' to database - are you sure?',
                    saveRiderData2,
                    null);
            }
        }
        saveRiderData2();
    };


    Riders.prototype = {
        parseJson: function(response) {
            list = response;
            ridersLoaded = true;
        },
    
        updateClubIDs: function(oldID, newID) {
            $.each(list, function (index, rider) {
                if (rider.ClubID === oldID) {
                    rider.ClubID = newID;
                }
            });
        }
    };

    $('#saveRiderData').click(function () {
        saveRiderData();
    });

    $('#getRiderData').click(function () {
        getRiderData();
    });
    return {
        getRiderData: function(){
            if (ridersLoaded) {
                if (ridersChanged) {
                    popup.Confirm('This will remove changes to any riders you have added or updated - are you sure?',
                    GetRiderData2,
                    null);
                }
            }
            getRiderData2();
        },
        getNewRider : function() { return newRider; },
        tempID: function () {
            var highest = 0;
            // find highest ID. This will probably NOT be the length of the riders array, since SQL will allocate higher IDs 
            $.each(list, function (index, rider) {
                if (rider.ID > highest) {
                    highest = rider.ID;
                    return false;
                }
            });
            return highest + 1;
        },
        riderFromName: function (ridername) {
            var i, rider;
            for (i = 0; i < list.length; i++) {
                rider = list[i];
                if (ridername === rider.Name) {
                    return rider;
                }
            }
            return 0;
        },
        riderFromID: function (riderID) {
            var i, rider;
            for (i = 0; i < list.length; i++) {
                rider = list[i];
                if (riderID === rider.ID) {
                    return rider;
                }
            }
            return null;
        }
    };
})(jQuery);

