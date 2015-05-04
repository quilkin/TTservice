"use strict";

function displayRider(rider,event) {


	//console.log(rider);
    $('#name').text(rider.Name);
   
    $('#club').text("Club: " + getClubName(rider.ClubID));
	$('#cat').text("Category: "+ rider.Category);
	if (event) {
	    var entry;
	    $.each(currentEvent.Entries,function(index,e) {
	        //for (ev in currentEvent.Entries) {
	        if (rider.ID == e.RiderID) {
	            entry = e;
	            return false; // break
	        }
	    });
	    if (entry != null) {
	        $('#start').text("Start time:   " + TimeString(entry.Start));
	        $('#number').text("Start Number: " + entry.Number);
	        if (entry.Finish/1000 < noTimeYet/1000) {
	            $('#time').text("Result Time:  " + TimeString(entry.Finish - entry.Start));
	            var distance = currentEvent.Distance();
	            var r = new Rider(rider.ID, rider.Name, rider.Age, rider.Category, rider.ClubID,rider.Email,rider.Best25);
	            var vetStdTime = r.VetStandardTime(distance);
	            if (vetStdTime != 0) {
	                $('#vetstd').text("Vet Std (" + distance+ " miles): " + TimeString(vetStdTime));
	                $('#vetonstd').text("Vet on Std:    " + TimeStringVetStd(entry.VetOnStd));
	            }
	        }
	    }
	    else {
	        $('#start').text("Error with entry details");
	    }

	}
	else {
	    $('#age').text("Age: " + userRole > 1? rider.Age : "Undisclosed");
	    $('#inevent').text("In event?: " + inEvent(rider)?"yes":"no");
	    //$('#time10').text(rider.time10);
	    if (rider.hasBest25()) {
	        var best25string = TimeStringH1(rider.Best25 * 1000);
	        $('#time25').text("Best '25' time: " + best25string);
	    }
	    //$('#target').text(rider.target);
        if (userRole > 1)
	        $('#email').text(rider.email);
	}
	
}

function BackToFinishLine() {
    ChangePage("finishLine");
}
function CancelFinished() {
    ChangePage("finishLine");
    SortEntries();
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
    SortEntries();
    CreateButtonGrid(0);
}

function getRiderFromGrid(riderID) {
    
    var rider = RiderFromID(riderID);
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



