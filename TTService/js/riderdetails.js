"use strict";

function BackToFinishLine() {
    ChangePage("finishLine");
}
function CancelFinished() {
    ChangePage("finishLine");
    event.SortEntries();
    CreateButtonGrid(0);
}
function ConfirmFinishTime(riderID)
{
    if (finishTimes.length > 0) {
        for (var index in finishTimes) {
            var t = finishTimes[index];
            //d = new Date(t);
            var htmlline = '<div data-role="controlgroup" data-type="horizontal">'
            htmlline += '<p class="ui-btn" onclick="RiderFinished(' + riderID + ',' + t + ')">Finished at: ' + TimeString(t) + '</p>';
            htmlline += '<p class="ui-btn" onclick="QueryDeleteFinishTime(' + t + ')" data-icon="delete" data-iconpos="notext">delete this timing</p></div>'

            $('#fTimes').append(htmlline);
        }
        var htmlline = '<div data-role="controlgroup" data-type="horizontal">'
        htmlline += '<p class="ui-btn" onclick="CancelFinished()">Cancel</p></div>';
        $('#fTimes').append(htmlline);
        $('#fTimes').trigger('create');
    }
    ChangePage("riderFinishPage");

    if (finishTimes.length == 0) {
        var popup = new myPopup('No times stored for this rider');
        popup.addMenuItem('Did not Start', RiderFinished, riderID, didNotStart);
        popup.addMenuItem('Did not Finish', RiderFinished, riderID, didNotFinish);
        popup.addMenuItem('Cancel', BackToFinishLine);
        popup.open();
    }

}

function UndoFinish(entry) {
    entry.Finish = noTimeYet;
    event.SortEntries();
    CreateButtonGrid(0);
}

function getRiderFromGrid(riderID) {
    
    var rider = Riders.riderFromID(riderID);
    var entry = getEntryFromRiderID(riderID);
    $('#rname').text(rider.Name);
    $('#rnumber').text(entry.Number);
    $('#fTimes').empty();

    if (entry.Finish / 1000 < noTimeYet / 1000) {
        var popup = new myPopup('Rider has already finished');
        popup.addMenuItem('Update with new finish time', ConfirmFinishTime, riderID);
        popup.addMenuItem("Oops, rider wasn't finished", UndoFinish, entry);
        popup.addMenuItem('Cancel', BackToFinishLine);
        popup.open();
    }
    else
        ConfirmFinishTime(riderID);
}



