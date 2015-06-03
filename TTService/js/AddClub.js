
var CycleClub = (function () {
    "use strict";

    var club = function (id, name, abbr) {
        this.ID = id;
        if (id <= 0) {
            // must create a temporary ID
            // This will be replaced with a permanent ID later, when there is communication with the DB
            this.ID = Clubs.getTempID();
            if (Riders.getNewRider() !== null) {
                Riders.getNewRider().ClubID = this.ID;
            }
        }
        this.Name = name;
        if (abbr.length > 2) {
            this.Abbr = abbr;
        }
        else {
            this.Abbr = name.substr(0, 5);
        }
    };
    return club;
}());


var Clubs = (function ($) {
    "use strict";

    var clubs = {},
        list = [],
        newClub,
        i,
        club,
        clubTableSettings = null;

    // intellisense helper
    list[0] = new CycleClub(1, '', '');

    clubs.parseJson = function (response) {
        var jsonlist = response;
        $.each(jsonlist, function (index, e) {
            // convert json list into list of club objects
            //club = new CycleClub(e.ID, e.Name, e.Abbr);
            //list[e.ID] = club;

            // make a fast lookup list
            list[e.ID] = e;
        });
    };
    // generate list of clubs for a table
    clubs.populateList = function (plist) {
        // clear any existing list
        while (plist.length > 0) {
            plist.pop();
        }
        $.each(list, function (index, club) {
            if (club !== undefined) {
                plist.push([club.Name]);
            }
        });
    };
    clubs.getID = function (clubname) {
        for (i = 0; i < list.length; i+=1) {
            club = list[i];
            if (club !== undefined && clubname === club.Name) {
                return club.ID;
            }
        }
        return 0;
    };
    clubs.getTempID = function () {
        // must create a temporary (negative) ID
        // This will be replaced with a permanemt ID later, when there is communication with the DB
        var highest = 0, posID;
        for (i = 0; i < list.length; i+=1) {
            club = list[i];
            if (club !== undefined) {
                posID = club.ID > 0 ? club.ID : -club.ID;
                if (posID > highest) {
                    highest = posID;
                }
            }
        }
        return -(highest + 1);
    };
    clubs.getName = function (clubID) {
        if (clubID < 0) { clubID = -clubID; }
        return list[clubID].Name;
        //for (i = 0; i < list.length; i++) {
        //    club = list[i];
        //    if (clubID === club.getId()) {
        //        return club.getName();
        //    }
        //}
        //return "unknown";
    };
    clubs.getAbbr = function (clubID) {
        if (clubID < 0) { clubID = -clubID; }
        return list[clubID].Abbr;
        //for (i = 0; i < list.length; i++) {
        //    club = list[i];
        //    if (clubID === club.getId()) {
        //        return club.getAbbr();
        //    }
        //}
        //return "unknown";
    };
    $('#btnNewClub').click(function () {
        var newClubName = clubTableSettings.search(),
            confirmation = newClubName + ' : enter new club?';
        popup.confirm(confirmation, function () {
            // temporary club ID; real one will be provided by server later

            list.push(new CycleClub(-1, newClubName, ''));
            // will be saved when rider list is saved
            //$("#slider-age").prop("disabled", false);
            //$("#checkLady").prop("disabled", false);
            $("#btnNewClub").hide();
            // get rid of club selection list
            $('#riderClubTable').html(newClubName);
        }, null);
    });
    // to be used when a new club is required (no clubs found from search)
    function noClubsFound(nRow, ssData, iStart, iEnd, aiDisplay) {
        if (iStart === iEnd) {
            $("#btnNewClub").show();

        } else {
            $("#btnNewClub").hide();

        }
    }
    function clubTable(clubsarray, existingClub) {
        var table = myTable('#riderClub', { "sSearch": "Select Club:" }, clubsarray, 200, [null, null], noClubsFound);
        clubTableSettings = table.settings();
        $('#riderClub tbody tr').on('click', function () {
            var nTds = $('td', this);
            newClub = $(nTds[0]).text();
            $('#riderClubTable').html(newClub);
            Riders.getNewRider().ClubID = Clubs.getID(newClub);
        });

    }

    //function updateClubID(index, club,newID) {
    //    if (club !== undefined && club.ID < 0) {
    //        // this was a temp ID, replace it
    //        club.ID = newID;
    //        // need to change clubIDs for any new riders........
    //        Riders.updateClubIDs(club.ID, newID);
    //    }
    //}
    // response contains a list of the clubs with their new IDs
    function clubsResponse(response) {
        var newID, index;
        for (index=0; index < response.length; index+=1) {
            newID = response[index].ID;
            // add new IDs to existing clubs
            $.each(list, function(index,club) {
                if (club !== undefined && club.ID < 0) {
                    // this was a temp ID, replace it
                    // first need to change clubIDs for any new riders........
                    Riders.updateClubIDs(club.ID, newID);
                    club.ID = newID;
                }
            });
        }
        popup.alert(response.length + " clubs uploaded OK");
        //Riders.saveRiderData3();
    }
    
    $('#displayClubList').click(function () {
        if (list === null) {
            popup.alert("No clubs loaded!");
            return;
        }
        var tableClubs = [];
        $.each(list, function (index, club) {
            if (club !== undefined) {
                tableClubs.push([club.Name, club.Abbr]);
            }
        });
        ttApp.changePage("clubsPage");
        myTable('#clubs2', { "sSearch": "Select Club:" }, tableClubs, ttApp.tableHeight(), [null, null], null);
    });

    clubs.uploadNewClubs = function () {
        var newClubs = [];
        $.each(list, function (index, club) {
            if (club!==undefined && club.ID < 0) {
                newClubs.push(club);
            }
        });
        if (newClubs.length > 0) {
            TTData.json("SaveNewClubs", "POST", newClubs, [clubsResponse,Riders.saveNewRiders], true);
            // riders will be saved *after* clubs have been saved
        }
        else {
            Riders.saveNewRiders();
        }
    };
    clubs.chooseRiderClub = function (clubID) {
        var tempclubs = [];
        for (i = 0; i < list.length; i+=1) {
            club = list[i];
            if (club !== undefined) {
                tempclubs.push([club.Name, club.Abbr]);
            }
        }
        if (clubID > 0) {
            newClub = this.getName(clubID);
            $('#riderClubTable').html(newClub);
        } else {
            newClub = "Club?";
        }

        // enable changing the club by double-clicking the club name
        $('#riderClubTable').dblclick(function () {
            clubTable(tempclubs, true);
        });
        if (clubID === 0) {
            // always show club list for new rider
            clubTable(tempclubs, false);
        }
    };

    

    return clubs;
}(jQuery));