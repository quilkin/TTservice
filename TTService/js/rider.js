/// <reference path="~\js\AddRider.js" />
/*global $,popup*/

var TTRider = (function () {
    "use strict";

    // private static
    var riderBeforeChange,
        ridersChanged,
        newRider,
        riderTableSettings = null,

        Categories = { Senior: 1, Vet: 2, Junior: 3, Juvenile: 4, Lady: 5, LadyVet: 6 },
        CatAbbr = ["None", "Sen", "Vet", "Jun", "Juv", "W", "WVet"];


    // constructor
    var rider = function (ID, Name, Age, Cat, Clubid, Email, Best25) {
        var id,
            name,
            age,
            category,
            clubid,
            email,
            best25,
            notarget = 86399,               // constant: no target time so leave as 23:59:59 for correct seeding

            tempID = false;

        name = Name;
        age = Age;
        category = Cat;
        clubID = Clubid;
        best25 = Best25 > 0 ? Best25:notarget;
        email = Email;

        if (ID > 0) {
            // club created with known ID from the db
            id = ID;
        } else {
            // must create a temporary ID
            // This will be replaced with a permanent ID later, when there is communication with the DB
            id = Riders.tempID;
            tempID = true;
        }

        this.getId = function () { return id; };
        this.getName = function () { return name; };
        this.getClubID = function () { return clubid; };
        this.getAge = function () { return age; };
        this.getEmail = function () { return email; };
        this.getBest25 = function () { return best25; };
        this.hasBest25 = function () { return best25 < notarget }
        this.isLady = function () {
            return category === Categories.Lady || cat === Categories.LadyVet;
        }
        //this.getCategory = function () { return category; };
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

        this.changed = false;
    };

    return {
        VetStandardTime: function (distance) {
            var time;
            var ageOver40 = this.Age - 40;
            if (this.Category === Categories.LadyVet) {
                ageOver40 += 8; // eight years difference on standard times
            }
            if (ageOver40 >= 0) {
                if (ageOver40 > VetStandard.Length) {
                    time = VetStandard[VetStandard.Length - 1];
                }
                else {
                    time = VetStandard[ageOver40];
                }
                // timein millisecs, allowing for 10-mile basis
                return time * distance * 100;
            }
            else
                return 0;
        },
        getCategory: function (age) {
            var cat = Categories.Senior;
            if (age < 16)
                cat = Categories.Juvenile;
            else if (age < 18)
                cat = Categories.Junior;
            else if (age >= 40)
                cat = Categories.Vet;
            if ($("#checkLady").prop("checked")) {
                cat = Categories.Lady;
                if (age >= 40)
                    cat = Categories.LadyVet;
            }
            return cat;
        },
        catAbbr: function () {
            return CatAbbr[category];
        }
    }
}())

