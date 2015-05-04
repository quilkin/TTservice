"use strict";

function StartLine()
{
    if (checkRole() == false)
        return;
    if (currentEvent.Synched) {
        popup.alert("Cannot re-sync after any riders have finished");
        return;
    }
    ChangePage("startLine");

}


function SyncStart()
{
    // adjust start time to match another stopwatch
    var d = new Date();
    // timediff will be positive if event started 'late'
    var timediff = d.valueOf() - currentEvent.Time;
    currentEvent.Time = d.valueOf();
    // now need to adjust start times of all entrants
    $.each(currentEvent.Entries, function (index, entry)
    {
        entry.Start += timediff;
    });
    $("#finish")[0].play();
    ChangePage("onTheDay");

}