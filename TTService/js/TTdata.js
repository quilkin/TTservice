"use strict";

/* ToDo:
save data to local memory
prompt save when quitting
feedback after save to db
popup buttons better touch response
edit rider - edit club
enter (just) times after an event
results: vets, team, women, juniors
re-order start times (if rider missed when entering names)!
'edit rider' does not return correctly
don't allow duplicate logins
•	Allow searching events by date
•	Allow creation of new courses
•	Redefine rider list in Surname order, not given name order.
•	Manual sorting of start list order
•	Allow emails to be sent from organiser’s email address
•	Create results tables for vets, women, juniors etc
•	Sort out birthdates and ages so that ages are automatically updated in subsequent years

*/


// use to save loaded length to check if any have been added
var ridersLoaded = false;

/// constants for 'non-real' times : all well into the future, and allows for DST corrections

var noTimeYet =     2000000003000;   // ride has not yet happened
var didNotFinish =  2000000002000;  // started to ride but then stopped
var didNotStart =   2000000001000;  // entered event but didn't start
var specialTimes =  2000000000000;  
var screenHeight = 0;
var tableHeight = 0;
var screenWidth = 0;
var buttonHeight = 0;
var realTimer;
var newdata = 0;


var UserRoles = { None: 0, Viewer: 1, ClubAdmin: 2, FullAdmin: 3 };
var userRole;

//some dummy objects so that intellisense knows what type these things are....

var coursedata = new Array(new Course(0, 0, ""));
var currentEvent = new Event(0, "", 0, 0, 0);
//var ridersdata = new Array(new Rider(0, "", 0, 0, 0, ""));
//var clubsdata = new Array(new club.Club(0, "", ""));
//var rider = new Rider(0, "", 0, 0, 0, "");
var entry = new Entry(0, 0, noTimeYet, noTimeYet, new Rider(0, "", 0, 0, 0, ""));

function Course(ID, distance, name)
{
    this.ID = ID;
    this.Distance = distance;
    this.Name = name;
}

function Event(ID, courseID, time, clubID, extraData) {
    this.CourseID = courseID;
    this.ClubID = clubID;
    this.Time = time;
    //this.Distance = getCourseDistance(courseID);

    var fullTime = new Date(time);
    //this.Course = function()
    //{
    //    for (var i = 0; i < coursedata.length; i++) {
    //        var course = coursedata[i];
    //        if (this.CourseID == course.ID)
    //            return course.Name;
    //    }
    //    return "unknown";
    //}
    this.Entries = new Array();
    this.ID = ID;
    this.OddData = extraData;
    this.Synched = false;

    this.PastEvent = function ()
    {
        var now = new Date().valueOf();
        var diff = time - now;
        return (diff < 0);
    };
    this.Distance = function ()
    {
        for (var i in coursedata) {
            var course = coursedata[i];
            if (this.CourseID === course.ID) {
                return course.Distance;
            }
        }
        return 0;
    };
}


String.prototype.capitalize = function ()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
};



// an entry for a single rider in a single event
// start & end times in millisecs
function Entry(number, start, finish, riderID) {
    this.Number = number;
    this.Start = start;
    this.Finish = finish;
    this.RiderID = riderID;
    this.Position = 0;
    this.VetOnStd = 0;
}

function myJson(url, type, data, successfunc, async)
{
    var dataJson = JSON.stringify(data);
    var thisurl = urlBase() + url;
    $.ajax({
        type: type,
        data: dataJson,
        url: thisurl,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: async,
        success: successfunc,
        error: webRequestFailed
    });
}


//function popup.alert(alertstr)
//{
//    CreatePopupAlert(alertstr);
//    //   if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/))    {
//    //if ($is_mobile) {
//    //    navigator.notification.alert(alertstr);
//    //}
//    //else
//    //     alert(alertstr);

//} 

function urlBase()
{
    if ($is_mobile) {
        return "http://www.timetrials.org.uk/Service1.svc/";
        // return "http://quilkin.azurewebsites.net/Service1.svc/"
    }
    else {
        return "http://www.timetrials.org.uk/Service1.svc/";
        //return "http://localhost:60080/Service1.svc/";
    }
}

function RiderFromID(riderID)
{
    for (var i in ridersdata) {
        var rider = ridersdata[i];
        if (riderID == rider.ID)
            return rider;
    }
    return null;
}
function RiderFromName(ridername)
{
    for (var i in ridersdata) {
        var rider = ridersdata[i];
        if (ridername === rider.Name) {
            return rider;
        }
    }
    return 0;
}

function getCourseName(courseID)
{
    for (var i in coursedata) {
        var course = coursedata[i];
        if (courseID === course.ID) {
            return course.Name;
        }
    }
    return "unknown";
}
//function getCourseDistance(courseID)
//{
//    for (var i = 0; i < coursedata.length; i++) {
//        var course = coursedata[i];
//        if (courseID == course.ID)
//            return course.Distance;
//    }
//    return 0;
//}
function getCourseID(coursename)
{
    for (var i in coursedata) {
        var course = coursedata[i];
        if (coursename === course.Name) {
            return course.ID;
        }
    }
    return 0;
}
function getEntryFromRiderID(riderID)
{
    for (var i in currentEvent.Entries) {
        entry = currentEvent.Entries[i];
        if (entry.RiderID === riderID) {
            return entry;
        }
    }
    return null;
}

function inEvent(rider)
{
    if (currentEvent == null)
        return 0;
    for (var i in currentEvent.Entries) {
        entry = currentEvent.Entries[i];
        if (entry.RiderID === rider.ID) {
            return rider.ID;
        }
    }
    return 0;
}

function ChangePage(page)
{
    //$.mobile.changePage("#" + page);
    //ChangePage("" + page);

    //$("body").pagecontainer("change", "#" + page, { transition: "slide" });
    $("body").pagecontainer("change", "#" + page);
}

// vet standard times for 10 miles, in seconds
var VetStandard =  [
    25*60+30,
    25*60+42,
    25*60+54,
    26*60+6,
    26*60+18,
    26*60+30,
    26*60+42,
    26*60+54,
    27*60+7,
    27*60+20,
    27*60+33,
    27*60+46,
    27*60+59,
    28*60+12,
    28*60+25,
    28*60+38,
    28*60+52,
    29*60+6,
    29*60+20,
    29*60+34,
    29*60+48,
    30*60+2,
    30*60+16,
    30*60+30,
    30*60+45,
    31*60+0,
    31*60+15,
    31*60+30,
    31*60+45,
    32*60+0,
    32*60+15,
    32*60+30,
    32*60+46,
    33*60+2,
    33*60+18,
    33*60+34,
    33*60+50,
    34*60+6,
    34*60+22,
    34*60+39,
    34*60+55,
    35*60+12,
    35*60+29,
    35*60+46,
    36*60+3,
    36*60+20,
    36*60+37,
    36*60+54,
    37*60+12,
    37*60+30,
    37*60+48,
    38*60+6,
    38*60+24,
    38*60+42,
    39*60+1,
    39*60+19,
    39*60+38,
    39*60+57,
    40*60+16,
    40*60+35,
    40*60+54,
    41*60+14,
    41*60+33,
    41*60+53,
    42*60+12,
    42*60+32,
    42*60+53,
    43*60+13,
    43*60+33,
    43*60+54];
