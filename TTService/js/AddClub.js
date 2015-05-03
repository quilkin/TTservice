var club = (function ($) {
    "use strict";


    var newClub,
        clubTableSettings = null,
        clubsdata = new Array(new Club(0, "", ""));


    function Club(ID, name, abbr) {
        var i,highest,c;
        this.Name = name;
        this.Abbr = abbr;
        this.ID = ID;
        this.tempID = false;
        if (ID > 0) {
            // club created with known ID from the db
            this.ID = ID;
        } else if (clubsdata !== null && clubsdata.length > 0) {
            // must create a temporary ID
            // This will be replaced with a permanemt ID later, when there is communication with the DB
            highest = 0;
            for (i in clubsdata) {
                c = clubsdata[i];
                if (c.ID > highest) {
                    highest = c.ID;
                }
            }
            this.ID = highest + 1;
            if (newRider !== null) {
                newRider.ClubID = this.ID;
            }
            this.tempID = true;
        }
    }

    function getClubID(clubname) {
        var i, club;
        for (i in clubsdata) {
            club = clubsdata[i];
            if (clubname === club.Name) {
                return club.ID;
            }
        }
        return 0;
    }

    function getClubName(clubID) {
        var club,i;
        for (i in clubsdata) {
            club = clubsdata[i];
            if (clubID === club.ID) {
                return club.Name;
            }
        }
        return "unknown";
    }
    function getClubAbbr(clubID) {
        var i,club;
        for (i in clubsdata) {
            club = clubsdata[i];
            if (clubID === club.ID) {
                return club.Abbr;
            }
        }
        return "unknown";
    }
    // to be used when a new club is required (no clubs found from search)
    function noClubsFound(nRow, ssData, iStart, iEnd, aiDisplay) {
        if (iStart === iEnd) {
            $("#btnNewClub").show();
            //$("#btnAddRider").hide();
            // $("#riderClubTable").prop("disabled", true);
            //$("#slider-age").prop("disabled", true);
            //$("#checkLady").prop("disabled", true);
        } else {
            $("#btnNewClub").hide();
            //  $("#btnAddRider").show();
            //  $("#riderClubTable").prop("disabled", false);
            //$("#slider-age").prop("disabled", false);
            //$("#checkLady").prop("disabled", false);
        }
        //$("#slider-age").slider("refresh");
        //$('input:checkbox').checkboxradio('refresh');
    }
    function clubTable(clubsarray, existingClub) {
        var table = myTable('#riderClub', { "sSearch": "Select Club:" }, clubsarray, 200, [null, null], noClubsFound);
        clubTableSettings = table.settings();
        $('#riderClub tbody tr').on('click', function () {
            var nTds = $('td', this);
            newClub = $(nTds[0]).text();
            $('#riderClubTable').html(newClub);
            newRider.ClubID = getClubID(newClub);
        });

    }

    club.chooseRiderClub = function (clubID) {
        var i, club, clubs = new Array(clubsdata.length);
        for (i in clubsdata) {
            club = clubsdata[i];
            clubs[i] = [club.Name, club.Abbr];
        }
        if (clubID > 0) {
            newClub = getClubName(clubID);
            $('#riderClubTable').html(newClub);
        } else {
            newClub = "Club?";

        }

        // enable changing the club by double-clicking the club name
        $('#riderClubTable').dblclick(function () {
            clubTable(clubs, true);
        });
        if (clubID === 0) {
            // always show club list for new rider
            clubTable(clubs, false);
        }
    }
    
    club.addNewClub = function()
    {
        var newClubName = clubTableSettings.search();
        var confirmation = newClubName + ' : enter new club?';
        myConfirm(confirmation, function() {
            // temporary club ID; real one will be provided by server later

                clubsdata.push(new Club(-1, newClubName, newClubName.substring(0, 5)));
            // will be saved when rider list is saved
            //$("#slider-age").prop("disabled", false);
            //$("#checkLady").prop("disabled", false);
            $("#btnNewClub").hide();
            // get rid of club selection list
            $('#riderClubTable').html(newClubName);
        },
            null)
    }
return club
})(jQuery)