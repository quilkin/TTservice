var finishLine = (function ($) {
    
    "use strict";

    // button grid size
    var finishLine = {},
        rows, cols,
        finishTimes = [],    // set of times clicked as riders go past finish line
        event = new Event(0, 0, 0, 0, 0);       // just to help with intellisense...

    function displayFinishTimes() {

        var txt = "Finished at...<br >",
            br = false;
 
        finishTimes.forEach(function(t){
            if (t !== null && t > 0) {
                txt += (ttTime.timeString(t));
            }
            txt += "...";
            if (br) {
                txt += "<br >";
                br = false;
            }
            else {
                br = true;
            }
        });
        $("#btnFinish").html(txt);
    }
    function deleteFinishTime(ftime) {
        // remove this time from stored list of finish times
        var index = finishTimes.indexOf(ftime);
        if (index >= 0) {
            finishTimes.splice(index, 1);
        }
        // back to finish more riders
        displayFinishTimes();
        ttApp.changePage("finishLine");
    }
    function queryDeleteFinishTime(ftime) {
        popup.confirm("Are you sure you want to skip this timing?",
            function () { deleteFinishTime(ftime); },
            null);
    }
    function riderFinished(entry, ftime) {
        //var entry = event.getEntryFromRiderID(riderID);

        entry.Finish = ftime;
        // remove this time from stored list of finish times
        deleteFinishTime(ftime);
        // and redraw grid of rider numbers
        event.sortEntries();
        createButtonGrid(0);
    }

    function cancelFinished() {
        ttApp.changePage("finishLine");
        event.sortEntries();
        createButtonGrid(0);
    }
    function BackToFinishLine() {
        ttApp.changePage("finishLine");
    }

    function UndoFinish(entry) {
        entry.Finish = ttTime.didNotFinish();
        event.sortEntries();
        createButtonGrid(0);
    }
    function confirmFinishTime(entry) {
        var htmlline, pop, index = 0;
        finishTimes.forEach(function (t) {
            htmlline = '<div data-role="controlgroup" data-type="horizontal">';
            htmlline += '<p class="ui-btn" id="finished' + t + '">Finished at: ' + ttTime.timeString(t) + '</p>';
            htmlline += '<p class="ui-btn" id="qydelete' + t + '" data-icon="delete" data-iconpos="notext">undo this time</p></div>';
            $('#fTimes').append(htmlline);
        });
        htmlline = '<div data-role="controlgroup" data-type="horizontal">';
        htmlline += '<p class="ui-btn" id="cancelFinished">Cancel</p></div>';
        $('#fTimes').append(htmlline);
        $("#fTimes").on('click', '#cancelFinished', function () { cancelFinished(); });
        $('#fTimes div p')
            .off('click')
            .on('click', function () {
                var btn = $(this);
                var btnID = $(this)[0].id,
                    time = parseInt(btnID.substring(8), 10);

                if (btnID.indexOf('finished') === 0) {
                    riderFinished(entry, time);
                }
                else {
                    queryDeleteFinishTime(time);
                }
            });

        $('#fTimes').trigger('create');

        ttApp.changePage("riderFinishPage");

        if (finishTimes.length === 0) {
            pop = new popup('No times stored for this rider');
            pop.addMenuItem('Did not Start', riderFinished, entry, ttTime.didNotStart());
            pop.addMenuItem('Did not Finish', riderFinished, entry, ttTime.didNotFinish());
            pop.addMenuItem('Cancel', BackToFinishLine);
            pop.open();
        }
    }

    function getRiderFromGrid(entryNumber) {
        var entry = event.getEntryFromNumber(entryNumber),
            riderID = event.getRiderFromNumber(entryNumber),
            rider = Riders.riderFromID(riderID),
            pop;
        $('#rname').text(entry.Number + ": " + rider.Name);
        //$('#rnumber').text(entry.Number);
        $('#fTimes').empty();

        if (entry.Finish / 1000 < ttTime.noTimeYet() / 1000) {
            pop = new popup('Rider has already finished');
            pop.addMenuItem('Update with new finish time', confirmFinishTime, entry);
            pop.addMenuItem("Oops, rider wasn't finished", UndoFinish, entry);
            pop.addMenuItem('Cancel', BackToFinishLine);
            pop.open();
        }
        else {
            confirmFinishTime(entry);
        }
    }
    function createButtonGrid(gridSequence) {
        // create an array of buttons, one for each entry, in a paged fashion
        var row = 0,
            col = 0,
            htmlline,
            done = false;

        // recursive call; need to remove existing buttons here
        $('#buttonArray').empty();

        if (gridSequence < 0) {
            // used the 'back' button and gone back too far
            gridSequence = 0;
        }
        if (gridSequence === 0) {
            // first page of showing grid
            if (event === null) {
                popup.alert("No event loaded");
                return;
            }
            event.Entries.forEach(function (entry) {
                // rider sequence is their position in the sequence of grid buttons. Not the same as rider number!
                entry.sequence = -1;
            });
        }
        else {
            // this is not first page of riders
            // create a button which, when clicked, will go back to first display, recursively
            ++col;
            htmlline = '<div class="ui-block-a"><button type="button"> << </button></div>';
            $('#buttonArray').append(htmlline);

        }
        event.Entries.every(function (entry, index) {
            var caption;

            if (entry.sequence >= 0) {
                // already displayed this entry, continue
                return true;
            }
            if (row === rows - 1 && col === cols - 1 && event.Entries.length > rows * cols - 1) {
                // lots of entries, need to create a new page and a button to get to it
                htmlline = '<div class="ui-block-c"><button type="button"> next </button></div>';
                done = true;
            }
            else {
                if (col >= cols) {
                    col = 0; ++row;
                }
                caption = entry.Number;
                if (entry.Finish / 1000 < ttTime.noTimeYet() / 1000) {
                    // rider has finished event, denote with brackets
                    caption = '(' + caption + ')';
                }
                htmlline = '<div class="ui-block-xx"><button type="button">' + caption + '</button></div>';
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
            if (done) {
                return false;
            }
            ++col;
            return true;
        });
        $('#buttonArray div button')
            .off('click')
            .on('click', function () {
                var btnText = $(this).text();
                if (btnText.indexOf('next', 0) >= 0) {
                    // go to next page of buttons
                    createButtonGrid(gridSequence);
                }
                else if (btnText.indexOf('<<', 0) >= 0) {
                    // go back to beginning
                    createButtonGrid(0)
                }
                else {
                    // a rider number has been chosen
                    btnText = btnText.replace('(', '');
                    getRiderFromGrid(parseInt(btnText, 10));
                }
            });
        $('#buttonArray').trigger('create');
        displayFinishTimes();
        ttApp.changePage("finishLine");
    }





    
    $('#finLine').click(function () {
        if (login.checkRole() === false) {
            return;
        }
        var buttonHeight = $('#finLine').height() * 3;   // allow for spaces between buttons

        event = EventList.currentEvent();
        if (event === null) {
            popup.alert("No data loaded!");
            return;
        }
        ttApp.resetScreenTimeout();
        event.sortEntries();

        //detectScreenHeight(); // may have changed in browser version
        rows = Math.floor(ttApp.screenHeight() / buttonHeight);
        if (ttApp.isMobile()) {
            rows -= 4; 
        }
        else {
            rows -= 3;
        }
        cols = 3;

        createButtonGrid(0);
    });

    $('#btnFinish').click(function () {
        if (finishTimes.length >= 6) {
            popup.alert("Cannot store any more finishes, please save times");
            return;
        }
        finishTimes.push(new Date().valueOf());
        if (ttApp.isMobile()) {
            var beep = new Media("/android_asset/www/res/beep_mp3.mp3");
            beep.play();
        }
        else {
            $("#finish")[0].play();
        }
        displayFinishTimes();
        // cannot sync start time again once a rider has finished
        event.sync();
        if (ttApp.isMobile()) {
            // keep device awake
            ttApp.resetScreenTimeout();
        }
    });
    return finishLine;
}(jQuery));

