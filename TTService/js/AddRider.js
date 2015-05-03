var addRider = (function ($) {
    "use strict";


var riderBeforeChange;
var ridersChanged;
var newRider;
var riderTableSettings = null;


function GetCategory(age)
{
    var cat = Categories.Senior;
    if (age < 16)
        cat = Categories.Juvenile;
    else if (age < 18)
        cat = Categories.Junior;
    else if (age >= 40)
        cat = Categories.Vet;
    if ($("#checkLady").prop("checked")) {
        cat = Categories.Lady;
        if (age >= 40)
            cat = Categories.LadyVet;
    }
    return cat;
}

// to be used when a new rider is required (no riders found from search)
function noRidersFound(nRow, ssData, iStart, iEnd, aiDisplay)
{
    if (iStart == iEnd) {
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

function ChooseRider(addToEvent)
{
    var names = new Array();
    $.each(ridersdata,function(index,rider) {
        if (rider.Age == null || rider.Name=="" || rider.ClubID==0)
            return true; // continue;
        if (addToEvent == false || inEvent(rider) == 0) {
            names.push(new Array(rider.Name, getClubAbbr(rider.ClubID)));
        }
    })
    var table = myTable('#newRider', { "sSearch": "Select Rider:", "sZeroRecords": "" }, names, 200, [null, null], noRidersFound);
    
    $('#riderClubTable').html("");
    $('#btnNewClub').hide();

    riderTableSettings = table.settings();
    $('#newRider tbody tr').on('click', function ()
    {
        var nTds = $('td', this);
        var newName = $(nTds[0]).text();
        $('#newRiderTable').html(newName);
        // enable getting back the table (to choose a different rider) by double-clicking the chosen name
        $('#newRiderTable').dblclick(function () {  ChooseRider(); });
        // place other details in form  from existing rider
        $.each(ridersdata, function (index, rider) {
            if (rider.Name == newName) {
                // save details so we can see if they have been changed
                riderBeforeChange = new Rider(rider.ID, rider.Name,  rider.Age, rider.Category, rider.ClubID, rider.Email, rider.Best25);
                club.chooseRiderClub(rider.ClubID);
                
                var cat = rider.Category;
                var age = rider.Age;

                if (rider.Best25 < notarget)
                {
                    var best25 = TimeString(rider.Best25*1000);
                    $("#riderRideTime").val(best25);
                }
                $("#riderAge").val(rider.Age);
                $("#riderEmail").val(rider.Email);
                if (cat == Categories.Lady || cat == Categories.LadyVet)
                    $("#checkLady").prop("checked", true);
                //$("#riderAge").slider("refresh");
                rider.Category = GetCategory(age);
                $("#checkIn").prop("checked", true);
                $('input:checkbox').checkboxradio('refresh');
                newRider = rider;
                return false; //break;
            }
        })
    });

}
var editRider = null;

addRider.editRider = function()
{
    if (checkRole() == false)
        return;
    var name = $('#name').text();
    var rider = RiderFromName(name);
    if (rider != null) {
        editRider = rider;
        addRider.addRider(currentEvent.ID > 0);
    }
}

addRider.addRider = function (addToEvent) {
    if (ridersdata.length < 2) {
        myAlert("No riders loaded, cannot autocomplete");
        return;
    }
    if (checkRole() == false)
        return;

    newRider = null;
    riderBeforeChange = null;

    ChangePage("addRiderPage");
    if (addToEvent && currentEvent.ID > 0) {
        $("#addRiderTitle").text(editRider == null ? "Add rider to event" : "Edit rider");
        $("#checkIn").prop("checked", true);
        //$("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
    }
    //else
    //    $("#addRiderHelp").text("Event aleady held: add rider's actual time");

    if (addToEvent == false || currentEvent.ID == 0 || currentEvent.PastEvent()) {
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
    var startNumber = currentEvent.Entries.length + 1;
    var age = 10;
    var email = "";
    if (editRider != null) {
        age = editRider.Age;
        email = editRider.Email;
        var thistime = editRider.Best25 * 1000;
        var entry =  getEntryFromRiderID(editRider.ID)
        if (entry != null)
        {
            startNumber = entry.Number;
            thistime = entry.Finish - entry.Start;

        }
        $("#riderRideTime").val(TimeString(thistime));
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
    $("#riderEmail").val(email)
    $("#riderStartNumber").val(startNumber);

    if (editRider == null) {
        ChooseRider(addToEvent);
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
         //}
     if (currentEvent.PastEvent()) {
         $("#lblRideTime").text("Result time:");
 //        $("#addRiderHelp").text("Event aleady held: add rider's actual time");
     }
     else {
         $("#lblRideTime").text("Recent 10 or 25 time:");
 //        $("#addRiderHelp").text("Add rider's best recent 10 or 25 time (if known)");
     }

}
//function ChooseNewClub()
//{
//    // re-enable other controls
//    $("#btnAddRider").show();
//    $("#riderClubTable").prop("disabled", false);
//    $("#slider-age").prop("disabled", false);
//    $("#checkLady").prop("disabled", false);
//    $("#btnNewRider").hide();
//    newRider = new Rider(0, newName, 0, 0, 0,"",notarget);
//    // get rid of name selection list
//    $('#newRiderTable').html(newName);

//    ChooseClub(0);
//    //newRider.newOne = true;
//}

addRider.AddNewRider =  function()
{
     var existingClub = 0;
    if (newRider == null) {
        //var newName = riderTableSettings.oPreviousSearch.sSearch;
        var newName = riderTableSettings.search();
        var newNameParts = newName.split(' ');
        newName = newNameParts[0].capitalize();
        if (newNameParts[1] != null)
            newName += (" " + newNameParts[1].capitalize());

        for (var i in currentEvent.Entries) {
            var entry = currentEvent.Entries[i];
            var r = RiderFromID(entry.RiderID);
            if (r!= null && r.Name == newName)
            {
                existingClub = r.ClubID;
                break;
            }
        }
        var confirmation = newName + ' : enter new rider?';
        if (existingClub>0)
            confirmation = newName + " ("+ getClubName(existingClub) +") is already in this event, is this the same name in a different club?";
        myConfirm(confirmation,
            function ()
            {
                // re-enable other controls
                $("#btnAddRider").show();
                $("#riderClubTable").prop("disabled", false);
                $("#slider-age").prop("disabled", false);
                $("#checkLady").prop("disabled", false);
                $("#btnNewRider").hide();
                newRider = new Rider(0, newName, 0, 0, 0,"",notarget);
                // get rid of name selection list
                $('#newRiderTable').html(newName);

                club.chooseRiderClub(0);
                //newRider.newOne = true;
            },
            null);
    }
}

function UpdateRiderDetails()
{
    newRider.ID = riderBeforeChange.ID;
    newRider.changed = true;
    for (var i in ridersdata) {
        var oldRider = ridersdata[i];
        if (oldRider.ID == newRider.ID) {
            ridersdata[i] = newRider;
            break;
        }
        ridersChanged = true;
    }
}

addRider.AddRiderAction = function() {

    var newR = true;
    var in_event = false;
    
    var age = $("#riderAge").val();
    
    if (age < 12 && age != 0) {
        myAlert("Must enter a valid age (12 or above), or zero if age unknown");
        return;
    }
    if (newRider == null) {
        myAlert("Error with rider...");
        return;
    }
    newRider.Age = age;
    newRider.Category = GetCategory(age);
    if (newRider.ClubID == 0) {
        myAlert("Must choose a club");
        return;
    }
    newRider.Email = $("#riderEmail").val();
       
    if (riderBeforeChange != null) {
        if (riderBeforeChange.Age != newRider.Age || riderBeforeChange.ClubID != newRider.ClubID || riderBeforeChange.Category != newRider.Category) {
            // same name, details have been changed
            if (confirm('Rider already in list. Update Details?')) {
                UpdateRiderDetails();
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
                myAlert("Rider not added or updated");
                //history.back();
                //return;
            }
        }
        else if ($("#checkIn").prop("checked")==false) {
            myAlert("No changes for rider");
            //history.back();
            //return;
        }
    }
    else {
        //// this is a new rider, needs adding to list
         ridersdata.push(newRider);
        ridersChanged = true;
    }

    // if required, add to event list if not already there
    if ($("#checkIn").prop("checked")) {
        if (inEvent(newRider) == 0 || currentEvent.PastEvent()) {

            //var startTimeS = $('#riderStartTime').val();
            //var startTimeD = timeFromString(startTimeS);
            //var startTime = startTimeD.valueOf();
            var startNumber;
            if (currentEvent.PastEvent()) {
                startNumber = $('#riderStartNumber').val();
                if (startNumber == null || startNumber == "" || isNaN(startNumber)) {
                    myAlert("Must set a starting number");
                    return;
                }
                // check that start number chosen hasn't already been used
                for (var i in currentEvent.Entries) {
                    var entry = currentEvent.Entries[i];
                    if (entry.Number == startNumber && entry.RiderID != newRider.ID) {
                        var rider = RiderFromID(entry.RiderID);
                        if (confirm("Start number already used by " + rider.Name + ". Do you want to re-allocate that one?")) {
                            entry.Number = currentEvent.Entries.length + 1;
                            break;
                        }
                        else {
                            // allow choosing a different number
                            return;
                        }
                    }
                }

            }
            else
                startNumber = currentEvent.Entries.length + 1;
            var currentTime = new Date(currentEvent.Time);
            var currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 0, 0, 0, 0);

            var startTime = currentEvent.Time + 1000 * 60 * startNumber;

            var endTime;
            if (currentEvent.PastEvent()) {
                var rideTimeS = $('#riderRideTime').val();
                if ($('#riderRideTime').val() == 'DNS') {
                    endTime = didNotStart;
                }
                else if ($('#riderRideTime').val() == 'DNF') {
                    endTime = didNotFinish;
                }
                else {

                    var rideTimeD = timeFromString(rideTimeS);
                    endTime = startTime + rideTimeD.valueOf();

                    if (endTime == null || isNaN(endTime)) {
                        var popup = new myPopup('Rider\'s time required');
                        popup.addMenuItem('Did not Start', TimePopup,  'DNS');
                        popup.addMenuItem('Did not Finish', TimePopup, 'DNF');
                        popup.addMenuItem('Enter a time');
                        popup.open();
                        return;
                    }
                }
                if (endTime == null || isNaN(endTime))
                    // not yet finished or time unknown
                    endTime = noTimeYet;

            }
            else {
                endTime = noTimeYet;
                var bestTimeS = $('#riderRideTime').val();
                var bestTimeD = timeFromString(bestTimeS);
                if (bestTimeD == null || isNaN(bestTimeD)) {
                    //ignore it
                }
                else {
                    newRider.Best25 = bestTimeD.valueOf()/1000;
                    // Best '25' time in seconds. Server will convert to '25' time from '10' time if necessary
                    if (riderBeforeChange != null) {
                        if (riderBeforeChange.Best25 != newRider.Best25)
                            UpdateRiderDetails();
                    }
                }
              
            }

            var e = new Entry(
            
                // ToDo **** allow for more than one minute between starts
                startNumber,
                startTime,
                endTime,
                newRider.ID);
            if (editRider == null)
                currentEvent.Entries.push(e);
            else {
                for (var i in currentEvent.Entries) {
                    if (currentEvent.Entries[i].RiderID == newRider.ID) {
                        currentEvent.Entries[i] = e;
                        break;
                    }
                }
 
            }
        }
        else
            myAlert("Rider already in event");
        in_event = true;
    }
    //  now add another rider...but first remove last rider's times, if any
    $('#riderStartNumber').val("");
    $('#riderRideTime').val("");
    if (editRider == null)
        AddRider(in_event);
    else {
        ChangePage("riderDetailsPage");
        displayRider(newRider,in_event);
        editRider = null;
       // history.back();
    }
}
function TimePopup(result)
{
    $('#riderRideTime').val(result);
    //$('#rideTimePopup').popup("close");
}

return addRider
})(jQuery)
//function newRidersDone() {
//    history.back();
//}
