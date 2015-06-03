/*global jQuery,popup,ttTime,Riders,Clubs*/

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
*   update vet's table
*/

var TTData = (function ($) {
    "use strict";

    var TTData = {};

    function urlBase() {
        if (ttApp.isMobile()) {
            return "http://www.timetrials.org.uk/Service1.svc/";
            // return "http://quilkin.azurewebsites.net/Service1.svc/"
        }

        //return "http://www.timetrials.org.uk/Service1.svc/";
        return "http://localhost:60080/Service1.svc/";

    }
    function webRequestFailed(handle, status, error) {
        popup.alert("Error ajax request: " + error);
        $("#submitButton").removeAttr("disabled");
    }

    TTData.json = function (url, type, data, successfunc, async) {
        var dataJson = JSON.stringify(data),
            thisurl = urlBase() + url;
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
    };
    return TTData;


}(jQuery));


//some dummy objects so that intellisense knows what type these things are....

//var coursedata = new Array(new Course(0, 0, ""));
//var currentEvent = new Event(0, "", 0, 0, 0);
//var ridersdata = new Array(new Rider(0, "", 0, 0, 0, ""));
//var clubsdata = new Array(new club.Club(0, "", ""));
//var rider = new TTRider(0, "", 0, 0, 0, "", ttTime.noTimeYet());


//function getCourseDistance(courseID)
//{
//    for (var i = 0; i < coursedata.length; i++) {
//        var course = coursedata[i];
//        if (courseID == course.ID)
//            return course.distance;
//    }
//    return 0;
//}




