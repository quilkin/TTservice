/*global jQuery,popup,ttTime,Riders,Clubs*/

/* ToDo:
*  save data to local memory
*  prompt save when quitting
*  feedback after save to db
*  popup buttons better touch response
*  edit rider - edit club
*  re-order start times (if rider missed when entering names)!
*  'edit rider' does not return correctly
*  don't allow duplicate logins
•	Allow creation of new courses
*   Add gpx files to courses
•	Redefine rider list in Surname order, not given name order.
•	Manual sorting of start list order
•	Allow emails to be sent from organiser’s email address
•	Create results tables for women, juniors etc
*   update vet's table
*   allow for penalty start times
*   allow for more than one minute between starts
*   allow deletion of entries if event hasn't yet happened
*/

var TTData = (function ($) {
    "use strict";

    var TTData = {};

    function urlBase() {
        if (ttApp.isMobile()) {
          //return "http://www.timetrials.org.uk/Service1.svc/";
           return "http://localhost:60080/Service1.svc/"
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




