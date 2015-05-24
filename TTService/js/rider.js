/*global jQuery,popup,ttTime,Riders,Clubs*/

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
        rider = function (ID, Name, Age, Cat, Clubid, Email, Best25) {
            var id,
                name,
                age,
                category,
                clubid,
                email,
                best25,
                notarget = 86399,               // constant: no target time so leave as 23:59:59 for correct seeding

                tempid = false;

            name = Name;
            age = Age;
            category = Cat;
            clubid = Clubid;
            best25 = Best25 > 0 ? Best25 : notarget;
            email = Email;

            if (ID > 0) {
                // club created with known ID from the db
                id = ID;
            } else {
                // must create a temporary ID
                // This will be replaced with a permanent ID later, when there is communication with the DB
                id = Riders.tempID;
                tempid = true;
            }

            this.getId = function () { return id; };
            this.getName = function () { return name; };
            this.getClubID = function () { return clubid; };
            this.getAge = function () { return age; };
            this.getEmail = function () { return email; };
            this.getBest25 = function () { return best25; };
            this.hasBest25 = function () { return best25 < notarget; };
            this.isLady = function () { return category === Categories.Lady || category === Categories.LadyVet; };
            this.tempID = function () { return tempid; };
            this.setName = function (value) {
                if (typeof value !== 'string') {
                    throw 'Club name must start with a letter';
                }
                if (value.length === 0) {
                    value = "Unknown rider";
                }
                if (value.length < 5 || value.length > 31) {
                    throw 'Rider name must be 5-31 characters long.';
                }
                name = value;
            };
            this.setAge = function (value) { age = value; };
            this.setEmail = function (value) { email = value; };
            this.setClubID = function (value) { clubid = value; };
            this.changed = false;
        };

    // public (shared across instances)
    rider.prototype = {
        vetStandardTime: function (distance) {
            var time,
                ageOver40 = this.getAge() - 40;
            if (this.getCategory() === Categories.LadyVet) {
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
        getCategory: function () {
            var age = this.getAge(),
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
            if ($("#checkLady").prop("checked")) {
                cat = Categories.Lady;
                if (age >= 40) {
                    cat = Categories.LadyVet;
                }
            }
            return cat;
        },
        catAbbr: function () {
            return CatAbbr[this.getCategory()];
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
                if (entry.RiderID === this.getId()) {
                    return this.getId();
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

            $('#name').text(this.getName());
            $('#club').text("Club: " + Clubs.getName(this.getClubID()));
            $('#cat').text("Category: " + this.getCategory());
            if (event) {
                $.each(event.getEntries(), function (index, e) {
                    //for (ev in currentEvent.Entries) {
                    if (self.getId() === e.RiderID) {
                        entry = e;
                        return false; // break
                    }
                });
                if (entry !== null) {
                    $('#start').text("Start time:   " + ttTime.timeString(entry.getStart()));
                    $('#number').text("Start Number: " + entry.getNum());
                    if (entry.getFinish() / 1000 < ttTime.noTimeYet() / 1000) {
                        $('#time').text("Result Time:  " + ttTime.timeString(entry.getFinish() - entry.getStart()));
                        distance = event.distance();
                        //var r = new Rider(rider.ID, rider.Name, rider.Age, rider.Category, rider.ClubID,rider.Email,rider.Best25);
                        vetStdTime = this.vetStandardTime(distance);
                        if (vetStdTime !== 0) {
                            $('#vetstd').text("Vet Std (" + distance + " miles): " + ttTime.TimeString(vetStdTime));
                            $('#vetonstd').text("Vet on Std:    " + ttTime.timeStringVetStd(entry.VetOnStd));
                        }
                    }
                }
                else {
                    $('#start').text("Error with entry details");
                }
            }
            else {
                $('#age').text("Age: " + login.checkRole()? this.getAge() : "Undisclosed");
                $('#inevent').text("In event?: " + this.inEvent() ? "yes" : "no");
                //$('#time10').text(rider.time10);
                if (this.hasBest25()) {
                    best25string = ttTime.timeStringH1(this.getBest25() * 1000);
                    $('#time25').text("Best '25' time: " + best25string);
                }
                //$('#target').text(rider.target);
                if (login.checkRole() > 1) {
                    $('#email').text(this.getEmail());
                }
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

