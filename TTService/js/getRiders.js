"use strict";

var newRiders;

function parseRidersJson(response)
{
    ridersdata = response;
    //// convert  times to jscript
    //for (var r in ridersdata) {
    //    rider = ridersdata[r];
    //    rider.time25 = rider.time25 == null ? noTimeYet : dateFromString(rider.time25);
    //    rider.time10 = rider.time10 == null ? noTimeYet : dateFromString(rider.time10);
    //    rider.target = rider.target == null ? noTimeYet : dateFromString(rider.target);
    //}
    ridersLoaded = true;
}


function parseClubsJson(response) {
    clubsdata = response;
}
function parseCoursesJson(response)
{
    coursedata = response;
}
function DisplayRiderList() {
    if (ridersdata == null) {
        popup.alert("No riders loaded!");
        return;
    }
    var riderArray = new Array();
    $.each(ridersdata, function (index, rider) {
        var cat = CatAbbr[rider.Category];
        if (inEvent(rider)) cat += " *";
        var best25string = "";
        if (rider.hasBest25())
            best25string = TimeStringH1(rider.Best25 * 1000);
        riderArray.push(new Array(rider.ID, rider.Name, getClubAbbr(rider.ClubID), cat, best25string));
    })

    ChangePage("ridersPage");

    var table = myTable('#riders', { "sSearch": "Select Rider:" }, riderArray, tableHeight, [{ "sTitle": "ID" }, { "sTitle": "Name" }, { "sTitle": "Club" }, { "sTitle": "Cat." }, { "sTitle": "Best 25" }], null);
    table.order([[1, 'asc'], [0, 'asc']]);
    $('#riders tbody tr').on('click', function () {
        var nTds = $('td', this);
        var riderID = $(nTds[0]).text();

        ChangePage("riderDetailsPage");
        var rider = RiderFromID(riderID);
        displayRider(rider,false);
    });
}

function DisplayClubList()
{
    if (clubsdata == null) {
        popup.alert("No clubs loaded!");
        return;
    }
    var clubs = new Array(clubsdata.length);
    for (var i in clubsdata) {
        var club = clubsdata[i];
        clubs[i] = new Array(club.Name, club.Abbr);
    }
    ChangePage("clubsPage");
    var table = myTable('#clubs2', { "sSearch": "Select Club:" }, clubs, tableHeight, [null, null], null);
}

function GetRiderData()
{
    if (ridersLoaded) {
        if (ridersChanged) {
            popup.Confirm('This will remove changes to any riders you have added or updated - are you sure?',
            GetRiderData2,
            null);
        }
    }
    GetRiderData2();
}
function GetRiderData2() {
    myJson("GetClubs", "GET", 0, parseClubsJson, true);
    myJson("GetRiders", "GET", 0, parseRidersJson, true);
    myJson("GetCourses", "GET", 0, parseCoursesJson, true);

    ridersChanged = false;
}

function RidersResponse(response)
{
    if (response > 0) {
        var newID = response;
        // add new IDs to existing riders
        for (var r in ridersdata) {
            var rider = ridersdata[r];
            if (rider.tempID) {
                rider.ID = newID++;
                rider.tempID = false;
            }

        }
        var count = newID - response;
        popup.alert(count + " riders uploaded OK");
    }
    else
        popup.alert("! No riders uploaded");
}
function ClubsResponse(response)
{
    if (response > 0) {
        var newID = response;
        // add new IDs to existing clubs
        for (var r in clubsdata) {
            var club = clubsdata[r];
            if (club.tempID) {
                // need to change clubIDs for any new riders........
                for (var i in newRiders) {
                    var rider = newRiders[i];
                    if (rider.ClubID == club.ID) {
                        rider.ClubID = newID;
                    }
                }
                club.ID = newID++;
                club.tempID = false;
            }

        }
        var count = newID - response;
        popup.alert(count + " clubs uploaded OK");
    }
    else
        popup.alert("! No clubs uploaded");
    //waitforClubs = false;
}

function SaveRiderData(event)
{
    if (checkRole() == false)
        return;

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
                SaveRiderData2,
                null);
        }
    }
    SaveRiderData2();
}

function SaveRiderData2()
{
    // we will be uploading new riders.These will have a temporary ID 
    newRiders = new Array();
    var i;
    for (i in ridersdata) {
        var rider = ridersdata[i];
        if (rider.tempID)
            newRiders.push(rider);
    }
    // but first upload new clubs.These will have a temporary ID  when uploaded, but post will return first new permanent ID
    // we will need the new club IDs for the new riders
    var newClubs = new Array();
    for (i in clubsdata) {
        var club = clubsdata[i];
        if (club.tempID)
            newClubs.push(club);
    }
    //waitforClubs = false;
    if (newClubs.length > 0) {
        // must not be async call to ensure clubs saved before riders call
        myJson("SaveNewClubs", "POST", newClubs, ClubsResponse, false);


     }
    // now upload the new riders.These will have a temporary ID  when uploaded, but post will return first new permanent ID

    var ridersJson, clubsJson, thisurl;
    if (newRiders.length > 0) {
        myJson("SaveNewRiders", "POST", newRiders, RidersResponse, true);

    }
    // now upload changed riders
    var changedRiders = new Array();
    for (i in ridersdata) {
        rider = ridersdata[i];
        if (rider.changed)
            changedRiders.push(rider);
    }
    if (changedRiders.length > 0) {
      
        myJson("SaveChangedRiders", "POST", changedRiders, function (response) { popup.alert(response); }, true);

    }


}