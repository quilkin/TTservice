"use strict";

// button grid size
var rows;
var cols;

// set of times clicked as riders go past finsih line
var finishTimes;
// one chosen from above
var finishTime;
var rider;

var screenTimeout;
var power;

function CreateButtonGrid(gridSequence) {
    // create an array of buttons, one for each entry, in a paged fashion
    var backButtonReqd = false;
    var backButtonDone = false;
    var row = 0;
    var col = 0;
    var done = false;
    
    // recursive call; need to remove existing buttons here
    $('#buttonArray').empty();

    if (gridSequence < 0)
        // used the 'back' button and gone back too far
        gridSequence = 0;
    if (gridSequence == 0) {
        // first page of showing grid
        $.each(currentEvent.Entries, function (index, entry)
        {
            // rider sequence is their position in the sequence of grid buttons. Not the same as rider number!
            entry.sequence = -1;
        });
    }
    else {
        // this is not first page of riders
        // create a button which, when clicked, will go back to first display, recursively
        ++col;
        var lastGrid = gridSequence - rows * cols + 1;
        var htmlline = '<div class="ui-block-a"><button type="button" onclick="CreateButtonGrid(0)"> << </button></div>';

        $('#buttonArray').append(htmlline);
    }


    $.each(currentEvent.Entries, function (index, entry) {

        if (entry.sequence >= 0)
                // already displayed this entry, continue
                return true;

        if (row == rows - 1 && col == cols - 1 && currentEvent.Entries.length > rows * cols - 1) {
            // lots of entries, need to create a new page and a button to get to it
            var htmlline = '<div class="ui-block-c"><button type="button" onclick="CreateButtonGrid(' + gridSequence + ')"> next </button></div>';
            done = true;
        }
        else
        {
            if (col >= cols)
            {
                col = 0; ++row;
            }
            var caption = entry.Number;
            if (entry.Finish/1000 < noTimeYet/1000)

                // rider has finished event, denote with brackets
                caption = '(' + caption + ')';

            var htmlline = '<div class="ui-block-xx"><button type="button" onclick="getRiderFromGrid(' + entry.RiderID + ')">' + caption + '</button></div>';
            switch (col) {
                // arrange buttons in columns - see jquerymobile 'ui-block'
                case 0: htmlline = htmlline.replace("xx", "a"); break;
                case 1: htmlline = htmlline.replace("xx", "b"); break;
                case 2: htmlline = htmlline.replace("xx", "c"); break;
            }
            entry.sequence = gridSequence;
            ++gridSequence;
 
        }
        $('#buttonArray').append(htmlline);
        if (done)
            return false;
        ++col;

    });
    $('#buttonArray').trigger('create');
    DisplayFinishTimes();
    ChangePage("finishLine");
}

function FinishLine() {
    if (checkRole() == false)
        return;

    if (currentEvent.Entries.length < 2) {
        popup.alert("No data loaded!");
        return;
    }
    screenTimeout = 0;
    SortEntries();
    buttonHeight = $('#finLine').height() * 3;  // allow for spaces between buttons

    detectScreenHeight(); // may have changed in browser version
    rows = Math.floor(screenHeight / buttonHeight);
    if ($is_mobile) rows -= 4; else rows -= 3;
    cols = 3;

    CreateButtonGrid(0);
    if (finishTimes == null)
        finishTimes = new Array();

}

function DisplayFinishTimes() {

    var txt = "Finished at...<br >";
    for (var index in finishTimes) {
        var t = finishTimes[index];
        if (t!=null  && t > 0)
        {
            txt += (TimeString(new Date(t)));
        }
        txt += "...";
        if ((index & 1)==1) txt += "<br >";
    }
    $("#btnFinish").html(txt);
}
function QueryDeleteFinishTime(ftime) {
    popup.Confirm("Are you sure you want to skip this timing?",
        function () { DeleteFinishTime(ftime); },
        null);
}

function DeleteFinishTime(ftime) {
    // remove this time from stored list of finish times
    var index = finishTimes.indexOf(ftime);
    if (index >= 0)
        finishTimes.splice(index, 1);
    // back to finish more riders
    DisplayFinishTimes();
    ChangePage("finishLine");
}
function RiderFinishing()
{
    if (finishTimes.length >= 6) {
        popup.alert("Cannot store any more finishes, please save times");
        return;
    }
    finishTimes.push(new Date().valueOf());
    if ($is_mobile) {
        var beep = new Media("/android_asset/www/res/beep_mp3.mp3");
        beep.play();
    }
    else {
        $("#finish")[0].play();
    }
    DisplayFinishTimes();
    // cannot sync start time again once a rider has fiinsihed
    currentEvent.Synched = true;
    if ($is_mobile) {
        // keep device awake
        screenTimeout = 0;

    }

}
function DefineRiderTime(entry)
{
    entry.Finish = finishTime;
    // remove this time from stored list of finish times
    DeleteFinishTime(finishTime);
    // and redraw grid of rider numbers
    SortEntries();
    CreateButtonGrid(0);
}
function RiderFinished(riderID,ftime) {
    finishTime = ftime;
    var entry = getEntryFromRiderID(riderID);
    //if (entry.Finish / 1000 < noTimeYet / 1000) {
    //    popup.Confirm("Rider has already finished; update the time?",
    //        DefineRiderTime(entry),
    //        BackToFinishLine);
    //}
    //else
        DefineRiderTime(entry);

}

function UpdateTime() {
        var d = new Date();
        $(".realtime").text(TimeString(d));


        if ($is_mobile)
        {
            // extend sleep timeout to 5 minutes
            ++screenTimeout;

            if (screenTimeout == 1)
                chrome.power.requestKeepAwake("display");

            if (screenTimeout == 300)
                chrome.power.releaseKeepAwake();

        }

}

