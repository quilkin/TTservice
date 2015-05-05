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
    if (currentEvent == null)
        return 0;
    for (var i in currentEvent.Entries) {
        entry = currentEvent.Entries[i];
        if (entry.RiderID === riderID) {
            return entry;
        }
    }
    return null;
}



function ChangePage(page)
{
    //$.mobile.changePage("#" + page);
    //ChangePage("" + page);

    //$("body").pagecontainer("change", "#" + page, { transition: "slide" });
    $("body").pagecontainer("change", "#" + page);
}
