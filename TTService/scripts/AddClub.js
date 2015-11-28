
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
        table;
        //clubTableSettings = null;

    // intellisense helper
    list[0] = new CycleClub(1, '', '');

    clubs.parseJson = function (response) {
        list.length = 0;
        response.forEach(function(club) {
            // make a fast lookup list
            list[club.ID] = club;
        });
    };
    // generate list of clubs for a table
    clubs.populateList = function (plist) {
        // clear any existing list
        plist.length = 0;
        list.forEach(function(club){
            if (club !== undefined) {
                plist.push([club.Name]);
                i += 1;
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

    };
    clubs.getAbbr = function (clubID) {
        if (clubID < 0) { clubID = -clubID; }
        return list[clubID].Abbr;

    };
    clubs.clubTable = function (existingClub) {
        var tempclubs = [];
        for (i = 0; i < list.length; i += 1) {
            club = list[i];
            if (club !== undefined) {
                tempclubs.push([club.Name, club.Abbr]);
            }
        }
        table = new TTTable('#riderClub',
            [   { "title": "" },
                { "title": "" }  ],
            "Select Club:", tempclubs, 200, noClubsFound, false);
        table.show(function (data) {
            //newClub = $(nTds[0]).text();
            newClub = data[0];
            $('#riderClubTable').html(newClub);
            Riders.getNewRider().ClubID = Clubs.getID(newClub);
            table.destroy();
        });
        //clubTableSettings = table.settings();
    }
    $('#btnNewClub').click(function () {
        var newClubName = table.getSettings().search(),
            confirmation = newClubName + ' : enter new club?';
        popup.confirm(confirmation, function () {
            // temporary club ID; real one will be provided by server later
            list.push(new CycleClub(-1, newClubName, ''));
            // will be saved when rider list is saved
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

        list.forEach(function(club){
            if (club !== undefined) {
                tableClubs.push([club.Name, club.Abbr]);
            }
        });
        ttApp.changePage("clubsPage");
        var table = new TTTable('#clubs2',[{ "title": "Club" }, { "title": "Abbr" }],
            "Select Club:", tableClubs, ttApp.tableHeight(), null, false);
        table.show(null);
    });

    clubs.uploadNewClubs = function () {
        var newClubs = [];
        //$.each(list, function (index, club) {
        list.forEach(function(club){
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
        //var tempclubs = [];
        //for (i = 0; i < list.length; i+=1) {
        //    club = list[i];
        //    if (club !== undefined) {
        //        tempclubs.push([club.Name, club.Abbr]);
        //    }
        //}
        if (clubID > 0) {
            newClub = this.getName(clubID);
            $('#riderClubTable').html(newClub);
        } else {
            newClub = "Club?";
        }

        // enable changing the club by double-clicking the club name
        $('#riderClubTable').dblclick(function () {
            clubs.clubTable(true);
        });
        if (clubID === 0) {
            // always show club list for new rider
            clubs.clubTable(false);
        }
    };

    

    return clubs;
}(jQuery));