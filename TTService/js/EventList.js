
"use strict";
var courses;
var clubs;
var clubTable, courseTable, eventTable;

function ChooseEventPage(existing)
{
    courses = new Array();
    clubs = new Array();
    $.each(coursedata, function (index, course) { courses.push(new Array(course.Name)); })
    $.each(clubsdata, function (index, club) { clubs.push(new Array(club.Name)); })

    if (existing) {
        var anyCourse = "(Any course)";
        var anyClub = "(Any club)";

        courses.push(new Array(anyCourse));
        clubs.push(new Array(anyClub));
        $("#eventSubmit").attr("onclick", "javascript:LoadEventAction()");
    }
    else
        $("#eventSubmit").attr("onclick", "javascript:AddEventAction()");

    if (currentEvent != null) {
        if (currentEvent.Entries.length > 1) {
            myConfirm('This will remove all details for existing event - are you sure?',
                function()
                {
                    currentEvent = null;
                    ChangePage('addEventPage');
                    //jQuery.mobile.changePage('#addEventPage', {
                    //    allowSamePageTransition: true,
                    //    transition: 'none',
                    //    reloadPage: true
                    //});
                    if (clubTable != null) {
                        $('#btnClub').text("Club");
                        clubTable.destroy(true);
                    }
                    if (courseTable != null) {
                        $('#btnCourse').text("Course");
                        courseTable.destroy(true);
                    }
                    if (eventTable != null) {
                        $("#eventSubmit").text("Search for event");
                        eventTable.destroy(true);
                    }
                },
                null)
        }
        else
            DoEventPage();
    }
    else
        DoEventPage();
}


function ChooseEventClub()
{
    clubTable = myTable('#clubs', { "search": "Select Club:" }, clubs, 200, [null], null);
    $('#clubs tbody tr').on('click', function ()
    {
        // add the club name to the button for reference
        var nTds = $('td', this);
        var club = $(nTds[0]).text(); 
        $('#btnClub').text(club);
        clubTable.destroy(true);
    })
}
function ChooseCourse()
{
    courseTable = myTable('#courses', { "search": "Select Course:" }, courses, 200, [null], null);
    $('#courses tbody tr').on('click', function ()
    {
        var nTds = $('td', this);
        var course = $(nTds[0]).text();
        $('#btnCourse').text(course);
        courseTable.destroy(true);
    })
}
function DoEventPage()
{
 
    ChangePage('addEventPage');

    //var table = myTable('#courses', { "sSearch": "Select Course:" }, courses, 200, [null], null);
    //$('#courses tbody tr').on('click', function ()
    //{
    //    // enable getting back the table (to choose a different course) by double-clicking the chosen course
    //    $('#coursesTable').dblclick(function () { DoEventPage(); });
    //    var nTds = $('td', this);
    //    var course = $(nTds[0]).text();
    //    $('#coursesTable').text(course);
    //    table = myTable('#clubs', { "sSearch": "Select Club:" }, clubs, 200, [null], null);
    //    $('#clubs tbody tr').on('click', function ()
    //    {
    //        // enable getting back the table (to choose a different club) by double-clicking the chosen club
    //        $('#clubsTable').dblclick(function () { DoEventPage(); });
    //        var nTds = $('td', this);
    //        var club = $(nTds[0]).text();
    //        $('#clubsTable').text(club);
    //    })
    //})
}
function AddEvent()
{
    if (checkRole() == false)
        return;
    ChooseEventPage(false);
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
    //if ($is_mobile == false)
    {
        $("#startDate").datepicker({ changeYear: true, dateFormat: "dd/mm/yy" });
        $("#startTime").timepicker({
            timeFormat: 'HH:mm:ss',
            controlType: 'select',
            stepHour: 1,
            stepMinute: 15
        });
    }
    newdata = 1;
}


function LoadEvent()
{

    ChooseEventPage(true);

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

}


function AddEventAction() {
    var coursename = $("#btnCourse").text();
    var club = $("#btnClub").text();
    var date = $("#startDate").val().split('/');
    var time = $("#startTime").val().split(':');

    var datetime = new Date(date[2],date[1]-1,date[0],time[0],time[1],0,0);
    var timemillisec = datetime.valueOf();
    currentEvent = new Event(0, getCourseID(coursename), timemillisec, getClubID(club), 0);

    ChangePage("home");
}

function DisplayEvent() {

    if (currentEvent.Entries.length < 1) {
        myAlert("No riders entered!");
        return;
    }
    ChangePage("entrypage");

    if ($is_mobile) {
        $('#btnEmailStart').hide();
    }
    if (checkRole() == false)
    {
        $('#btnEmailStart').hide();
    }
    var entrydata = new Array();

    if (screenWidth < 500) {
        $.each(currentEvent.Entries, function (index, entry)
        {
            var rider = RiderFromID(entry.RiderID);
            if (rider == null)
                rider = new Rider(entry.RiderID, "Rider not found", 0, 1, 0, "");
            entrydata.push(new Array(entry.Number, rider.Name, getClubAbbr(rider.ClubID), TimeString(entry.Start)));
        })
        myTable('#entries', { "search": "Find entry" }, entrydata, tableHeight, [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Start" }], null);
    }
    else {
        // more details
        $.each(currentEvent.Entries, function (index, entry)
        {
            var r = RiderFromID(entry.RiderID);
            var rider;
            if (r == null)
                rider = new Rider(entry.RiderID, "Rider not found", 0, 1, 0, "", notarget);
            else
                rider = new Rider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email,r.Best25);
            var target = "";
            if (rider.Best25 < notarget)
                target = TimeStringH1(rider.Best25 * 1000);
            if (rider.Name == 'Ali White')
                rider.Category = rider.Category; // debug line
            var cat = CatAbbr[rider.Category];
            var stdTime = rider.VetStandardTime(currentEvent.Distance());
            var stdTimeStr = stdTime > 0 ? TimeStringH1(stdTime) : "";
            entrydata.push(new Array(entry.Number, rider.Name, cat, stdTimeStr, target, getClubName(rider.ClubID), TimeString(entry.Start)));
        })
        myTable('#entries', { "search": "Find entry" }, entrydata, tableHeight, [{ "title": "#" }, { "title": "Name" }, { "title": "Cat" }, { "title": "VetStd" }, { "title": "Target" }, { "title": "Club" }, { "title": "Start" }], null);

    }

    // *********** ToDo: allow deletion of entries but only if event hasn't happened
    $('#entries tbody tr').on('click', function ()
    {
        var nTds = $('td', this);
        var name = $(nTds[1]).text();
        ChangePage("riderDetailsPage");

        var rider = RiderFromName(name);
        displayRider(rider,true);
    });

}



function EmailStartSheet()
{
    if (checkRole() == false)
        return;
    myJson("EmailStartSheet", "POST", currentEvent.ID, function (response) { myAlert(response); }, true);
}
function EmailResultSheet()
{
    if (checkRole() == false)
        return;
    myJson("EmailResultSheet", "POST", currentEvent.ID, function (response) { myAlert(response); }, true);
}

var updatingEntry;

function UpdateEventTimes()
{

    if (currentEvent.Entries.length < 1) {
        myAlert("No riders entered!");
        return;
    }
    ChangePage("timesPage");

    var entrydata = new Array();

    $.each(currentEvent.Entries, function (index, entry)
    {
        var rider = RiderFromID(entry.RiderID);
        if (rider == null)
            rider = new Rider(entry.RiderID, "Rider not found", 0, 1, 0, "");
        var rideTimeString;
        var rideTime = entry.Finish - entry.Start;
        if (entry.Finish/1000 == didNotStart/1000) {
            rideTimeString = "DNS";
        }
        else if (entry.Finish/1000 == didNotFinish/1000) {
            rideTimeString = "DNF";
        }
        else if (entry.Finish >= specialTimes)
            rideTimeString = "???";
        else
            rideTimeString = TimeStringH1(rideTime);
        entrydata.push(new Array(entry.Number, rider.Name, getClubAbbr(rider.ClubID), rideTimeString));
    })
    var table = myTable('#times', { "search": "Find entry" }, entrydata, tableHeight - 100, [{ "title": "#" }, { "title": "Name" }, { "title": "Club" }, { "title": "Time" }], null);
    table.order([ [1, 'asc']]);
    $("#riderTime").timepicker({
        showSecond: true,
        timeFormat: 'HH:mm:ss',
        controlType: 'select',
        stepHour: 1,
        stepMinute: 1,
        stepSecond: 1
    });
    $('#times tbody tr').on('click', function ()
    {
        var nTds = $('td', this);
        updatingEntry = $(nTds[0]).text();
        var name = $(nTds[1]).text();
        var time = $(nTds[3]).text();
        $('#riderTime').val(time);
        $('#riderTimeLabel').text(name);
    });

}
// save an updated rider's time
function SaveTime()
{
    var endTime;
    var startTime = currentEvent.Time + 1000 * 60 * updatingEntry;
    var rideTimeS = $('#riderTime').val();
    if ($('#riderTime').val() == 'DNS') {
        endTime = didNotStart;
    }
    else if ($('#riderTime').val() == 'DNF') {
        endTime = didNotFinish;
    }
    else {
        var rideTimeD = timeFromString(rideTimeS);
        endTime = startTime + rideTimeD.valueOf();

    }
    if (endTime == null || isNaN(endTime))
        // not yet finished or time unknown
        endTime = noTimeYet;
    var entry;
    $.each(currentEvent.Entries, function (index, e)
    {
        //for (ev in currentEvent.Entries) {
        if (updatingEntry == e.Number) {
            e.Finish = endTime;
            UpdateEventTimes();
            return false; // break
        }
    });
    newdata = 1;
}

function DNS()
{
    $('#riderTime').val('DNS');
}
function DNF()
{
    $('#riderTime').val('DNF');
}

function SaveEvent()
{
    if (checkRole() == false)
        return;
    // first save any new riders
    SaveRiderData(true);
    myJson("SaveEvent", "POST", currentEvent, function (response) { myAlert(response); }, true);
    newdata = 0;
}

function SortEvent()
{
    var evID = currentEvent.ID;
    if (checkRole() == false)
        return;
    // first save any new riders
    SaveRiderData(true);
    // must not be async call to ensure clubs saved before seeds call
    myJson("SaveEvent", "POST", currentEvent, function (response) { myAlert(response); }, false);

    myJson('SeedEntries', "POST", currentEvent, function (entries)
    {
        $.each(entries, function (index, e)
        {
            currentEvent.Entries[index] = e;
        });
        DisplayEvent();
    }, true);
}

// choose an event from existing events in database, based on selection of parameters
function LoadEventAction()
{
    var clubID = getClubID($("#btnClub").text());
    var courseID = getCourseID($("#btnCourse").text())

    var fromdate = $("#startDate").val();
    var todate = $("#endDate").val();
    var fromtime = fromdate.Length > 0 ? Date.parse(fromdate) : new Date(2000, 1);
    var totime = todate.Length > 0 ? Date.parse(todate) : new Date(2037, 1);
    var datemillisec = fromtime.valueOf();
    var days = (totime.valueOf() - datemillisec) / (1440 * 60 * 1000);
    days = days.toFixed(0);
    // use extra data field for number of days in search
    var newEvent = new Event(0,courseID, datemillisec, clubID, days);
    myJson("LoadEvents", "POST", newEvent, parseEventsJson, true);
}

function parseEventsJson(response)
{

    var events = response;
    if (events.length == 0) {
        $('#eventsTable').html('No matching events found');
        return;
    }
    $('#events').empty();
    var eventData = new Array();

    $.each(events, function (index, ev)
    {
        var date = new Date(ev.Time);
        eventData.push(new Array(ev.ID, getClubName(ev.ClubID), getCourseName(ev.CourseID), DateTimeString(date)));

    });
    currentEvent = null;
    eventTable = myTable('#events', { "search": "" }, eventData, tableHeight-100,
        [{ "title": "#" },
          { "title": "Club" },
          { "title": "Course" },
          { "title": "Date/Time" } ],
          null);

    // trying to make first column invisible but that messes up indexing
    //var column = eventTable.column(0);
    //column.visible(false);

    $('#events tbody tr').on('click', function ()
    {
        var nTds = $('td', this);
        var eventID = $(nTds[0]).text();

        // find the correct event from the list
        $.each(events, function (index, ev)
        {
            if (ev.ID == eventID) {
                currentEvent = new Event(ev.ID, ev.CourseID, ev.Time, ev.ClubID, 0);
                return false;  // i.e. break out of 'each' loop
            }
        });
        if (currentEvent == null)
        {
            myAlert("Error finding correct event");
            return false;
        }   
        // now need to ask server for all its entries for this event
        myJson('LoadEntries', "POST", eventID, function (entries)
            {
                $.each(entries, function (index, e)
                {
                    currentEvent.Entries[index] = e;
                });
               // myAlert(entries.length + " riders loaded for this event");
                if (currentEvent.PastEvent())
                    Results();
                else {
                    // myAlert("No results yet, event has not happened");

                    myAlert(entries.length + " riders loaded for this (future) event");
                    ChangePage("home");
                }
                
            }, true);

    });

}
