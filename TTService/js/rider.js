var TTRider = (function ($) {
    "use strict";

    // private static
    var Categories = { Senior: 1, Vet: 2, Junior: 3, Juvenile: 4, Lady: 5, LadyVet: 6 },
        CatAbbr = ["None", "Sen", "Vet", "Jun", "Juv", "W", "WVet"],

// vet standard times for 10 miles, in seconds
        vetStandard = [
        25 * 60 + 30,
        25 * 60 + 42,
        25 * 60 + 54,
        26 * 60 + 6,
        26 * 60 + 18,
        26 * 60 + 30,
        26 * 60 + 42,
        26 * 60 + 54,
        27 * 60 + 7,
        27 * 60 + 20,
        27 * 60 + 33,
        27 * 60 + 46,
        27 * 60 + 59,
        28 * 60 + 12,
        28 * 60 + 25,
        28 * 60 + 38,
        28 * 60 + 52,
        29 * 60 + 6,
        29 * 60 + 20,
        29 * 60 + 34,
        29 * 60 + 48,
        30 * 60 + 2,
        30 * 60 + 16,
        30 * 60 + 30,
        30 * 60 + 45,
        31 * 60 + 0,
        31 * 60 + 15,
        31 * 60 + 30,
        31 * 60 + 45,
        32 * 60 + 0,
        32 * 60 + 15,
        32 * 60 + 30,
        32 * 60 + 46,
        33 * 60 + 2,
        33 * 60 + 18,
        33 * 60 + 34,
        33 * 60 + 50,
        34 * 60 + 6,
        34 * 60 + 22,
        34 * 60 + 39,
        34 * 60 + 55,
        35 * 60 + 12,
        35 * 60 + 29,
        35 * 60 + 46,
        36 * 60 + 3,
        36 * 60 + 20,
        36 * 60 + 37,
        36 * 60 + 54,
        37 * 60 + 12,
        37 * 60 + 30,
        37 * 60 + 48,
        38 * 60 + 6,
        38 * 60 + 24,
        38 * 60 + 42,
        39 * 60 + 1,
        39 * 60 + 19,
        39 * 60 + 38,
        39 * 60 + 57,
        40 * 60 + 16,
        40 * 60 + 35,
        40 * 60 + 54,
        41 * 60 + 14,
        41 * 60 + 33,
        41 * 60 + 53,
        42 * 60 + 12,
        42 * 60 + 32,
        42 * 60 + 53,
        43 * 60 + 13,
        43 * 60 + 33,
        43 * 60 + 54],


    // constructor
        rider = function (id, name, age, lady, clubid, email, best25) {
            var notarget = 86399;               // constant: no target time so leave as 23:59:59 for correct seeding


            this.Name = name;
            this.Age = age;
            this.Lady = lady;
            this.ClubID = clubid;
            this.Best25 = best25 > 0 ? best25 : notarget;
            this.Email = email;
            this.changed = false;
            this.ID = id;
            if (id <= 0) {
                // must create a temporary ID
                // This will be replaced with a permanent ID later, when there is communication with the DB
                this.ID = Riders.tempID();
            }

            //this.getId = function () { return id; };
            ////this.getName = function () { return name; };
            //this.getClubID = function () { return clubid; };
            //this.getAge = function () { return age; };
            //this.getEmail = function () { return email; };
            //this.getBest25 = function () { return best25; };
            this.getCategory = function () {
                var cat, age;
                age = this.Age,
                    cat = Categories.Senior;
                if (age < 16) {
                    cat = Categories.Juvenile;
                }
                else if (age < 18) {
                    cat = Categories.Junior;
                }
                else if (age >= 40) {
                    cat = Categories.Vet;
                }
                if (this.Lady) {
                    cat = Categories.Lady;
                    if (age >= 40) {
                        cat = Categories.LadyVet;
                    }
                }
                return cat;
            },
            this.catAbbr = function () {
                return CatAbbr[this.getCategory()];
            },
            this.hasBest25 = function () { return this.Best25 < notarget; };
            //this.isLady = function () { return this.Category === Categories.Lady || this.Category === Categories.LadyVet; };
            this.tempID = function () { return (this.ID < 0); };
            //this.setName = function (value) {
            //    if (typeof value !== 'string') {
            //        throw 'Club name must start with a letter';
            //    }
            //    if (value.length === 0) {
            //        value = "Unknown rider";
            //    }
            //    if (value.length < 5 || value.length > 31) {
            //        throw 'Rider name must be 5-31 characters long.';
            //    }
            //    name = value;
            //};
            //this.setAge = function (value) { age = value; };
            //this.setEmail = function (value) { email = value; };
            //this.setClubID = function (value) { clubid = value; };

        };

    // public (shared across instances)
    rider.prototype = {
        vetStandardTime: function (distance) {
            var time,
                ageOver40 = this.Age - 40;
            if (this.Category === Categories.LadyVet) {
                ageOver40 += 8; // eight years difference on standard times
            }
            if (ageOver40 >= 0) {
                if (ageOver40 > vetStandard.Length) {
                    time = vetStandard[vetStandard.Length - 1];
                }
                else {
                    time = vetStandard[ageOver40];
                }
                // time in millisecs, allowing for 10-mile basis
                return time * distance * 100;
            }
            return 0;

        },


        inEvent: function()
        {
            var i,entry,
                event = EventList.currentEvent();

            if (event === null) {
                return 0;
            }
            for (i = 0; i < event.getEntries().length; i++) {
                entry = event.getEntries()[i];
                if (entry.RiderID === this.ID) {
                    return this.ID;
                }
            }
            return 0;
        },
        displayRider: function (event) {
            var entry = null,
                event = EventList.currentEvent(),
                distance,
                vetStdTime,
                best25string,
                self = this;

            $('#headerDetails').text(this.Name);
            $('#club').text(Clubs.getName(this.ClubID));
            $('#cat').text(this.catAbbr());
            $('#riderID').text(this.ID);
            $('#time25').text("");
            if (login.checkRole()) {
                $('#email').text(this.Email);
                $('#age').text(this.Age);
                if (this.hasBest25()) {
                    best25string = ttTime.timeStringH1(this.Best25 * 1000);
                    $('#time25').text(best25string);
                }
            }
            else
            {
                $('#email').text("");
                $('#age').text("");
            }

            if (event !== null && event.ID > 0) {
                event.getEntries().every(function(e){
                    if (self.ID === e.RiderID) {
                        entry = e;
                        return false; // break
                    }
                    return true;
                });
                if (entry !== null) {
                    $('#start').text(ttTime.timeString(entry.Start));
                    $('#number').text(entry.Number);
                    if (entry.Finish / 1000 < ttTime.noTimeYet() / 1000) {
                        $('#time').text(ttTime.timeString(entry.Finish - entry.Start));
                        distance = event.distance();
                        //var r = new Rider(rider.ID, rider.Name, rider.Age, rider.Category, rider.ClubID,rider.Email,rider.Best25);
                        vetStdTime = this.vetStandardTime(distance);
                        if (vetStdTime !== 0) {
                            $('#vetstd').text("(" + distance + " miles) " + ttTime.TimeString(vetStdTime));
                            $('#vetonstd').text(ttTime.timeStringVetStd(entry.VetOnStd));
                        }
                    }
                }
            }
            else {
                $('#number').text("(No event loaded)");
                $('#start').text("");
                $('#time').text("");
                $('#vetstd').text("");
                $('#vetonstd').text("");
            }
        }
    };
    $('#dns').click(function () {
        $('#riderTime').val('DNS');
    });

    $('#dnf').click(function () {
        $('#riderTime').val('DNF');
    });
    return rider;
}(jQuery));

