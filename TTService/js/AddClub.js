/*global jQuery,popup,TTRider*/

var CycleClub = (function () {
    "use strict";

    // constructor
    var club = function (ID, Name, Abbr) {
            // private
            var id, tempID, name, abbr;
            if (ID > 0) {
                // club created with known ID from the db
                id = ID;
            } else {
                // must create a temporary ID
                // This will be replaced with a permanent ID later, when there is communication with the DB
                id = Clubs.tempID;
                tempID = true;
            }

            name = this.setName(Name);
            abbr = this.setAbbr(Abbr);

            if (Riders.newRider !== null) {
                Riders.newRider.ClubID = this.ID;
            }
            // public (this instance only)
            this.getId = function () { return id; };
            this.getName = function () { return name; };
            this.getAbbr = function () { return abbr; };
            this.setName = function (value) {
                if (typeof value !== 'string') {
                    throw 'Club name must start with a letter';
                }
                if (value.length === 0) {
                    value = "Unknown club";
                }
                if (value.length < 5 || value.length > 31) {
                    throw 'Club name must be 5-31 characters long.';
                }
                name = value;
            };
            this.setAbbr = function (value) {
                if (typeof value !== 'string') {
                    throw 'Club name must start with a letter';
                }
                if (value.length === 0) {
                    // default is first 5 chars of name
                    value = name.substr(0, 5);
                }
                if (value.length < 3 || value.length > 5) {
                    throw 'Club abbr must be 3-5 characters long.';
                } 
                abbr = value;
            };
        };
    // public static
    club.getNextId = function () {
        return nextId;
    };

    // public (shared across instances)
    club.prototype = {
     
        announce: function () {
            // not required, left in from example code
            popup.alert('Hi there! My id is ' + this.getId() + ' and my club is "' + this.getName() + '"!\r\n' +
                  'The next club\'s id will be ' + CycleClub.getNextId() + '!');
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

    $('#btnNewClub').click(function () {
        var newClubName = clubTableSettings.search(),
            confirmation = newClubName + ' : enter new club?';
        popup.Confirm(confirmation, function () {
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
            //$("#btnAddRider").hide();
            //$("#riderClubTable").prop("disabled", true);
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
            Riders.newRider.ClubID = Clubs.getID(newClub);
        });

    }

    return {
        count: function() {
            return list.length;
        },
        tempID: function() {
            var highest = 0;
            // find highest ID. This will probably NOT be the length of the riders array, since SQL will allocate higher IDs 
            for (var i in list) {
                var r = list[i];
                if (r.ID > highest) {
                    highest = r.ID;
                }
            }
            return highest + 1;
        },
        getID: function (clubname) {
            for (i = 0; i < list.length; i++) {
                club = list[i];
                if (clubname === club.getName()) {
                    return club.getId();
                }
            }
            return 0;
        },
        getName: function (clubID) {
            for (i = 0; i < list.length; i++) {
                club = list[i];
                if (clubID === club.getID) {
                    return club.getName;
                }
            }
            return "unknown";
        },
        getAbbr: function (clubID) {
            for (i = 0; i < list.length; i++) {
                club = list[i];
                if (clubID === club.ID) {
                    return club.getAbbr;
                }
            }
            return "unknown";
        },
        chooseRiderClub: function (clubID) {
            var tempclubs = new Array(list.length);
            for (i = 0; i < list.length; i++) {
                club = list[i];
                tempclubs[i] = [club.Name, club.Abbr];
            }
            if (clubID > 0) {
                newClub = CycleClub.getName(clubID);
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
    };

    //return club
}(jQuery));