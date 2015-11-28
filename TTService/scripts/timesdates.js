/*global console*/

var ttTime = (function () {

    "use strict";
    var ttTime = {},
        pad2 = function (num) {
            var s = "00" + num;
            return s.substr(s.length - 2);
        },
        dateString = function (time) {
            // toLocaleTimeString() is no good for different platforms
            //return [time.getFullYear(), pad2(time.getMonth() + 1), pad2(time.getDate())].join('-');
            return [pad2(time.getDate()),pad2(time.getMonth() + 1),time.getFullYear()].join('/');

        },
        timeString = function (time) {
            // toLocaleTimeString() is no good for different platforms
            return [pad2(time.getHours()), pad2(time.getMinutes())].join(':');
        },
        timeStringSecs = function (time) {
            return [pad2(time.getHours()), pad2(time.getMinutes()), pad2(time.getSeconds())].join(':');
        };

    return {
        // constants for 'non-real' times : all well into the future, and allows for DST corrections
        noTimeYet: function () { return 2000000003000; },   // ride has not yet happened
        didNotFinish: function () { return 2000000002000; },  // started to ride but then stopped
        didNotStart: function () { return 2000000001000; },  // entered event but didn't start
        specialTimes: function () { return 2000000000000; },

        dateString: function (time) {
            // toLocaleTimeString() is no good for different platforms
            //return [time.getFullYear(), pad2(time.getMonth() + 1), pad2(time.getDate())].join('-');
            return dateString(time);
        },
        timeString: function (t) {
            var time = new Date(t);
            return timeStringSecs(time);
        },
        dateTimeString: function (t) {
            var time = new Date(t);
            return dateString(time) + " " + timeString(time);
        },
        timeStringH1: function(t)
        {
            // showing only one digit for Hour
            var time = new Date(t);
            return [time.getHours(), pad2(time.getMinutes()), pad2(time.getSeconds())].join(':');
        },
        timeStringVetStd: function (t)
        {
            if (t === 0) {
                return "";
            }
            var timestr, time, minus = false;
            if (t < 0) {
                t = -t;
                minus = true;
            }
            // showing only mins and secs, and + or - as appropriate
            time = new Date(t);
            timestr = [pad2(time.getMinutes()), pad2(time.getSeconds())].join(':');
            if (minus) {
                timestr = '-' + timestr;
            } else {
                timestr = '+' + timestr;
            }
            return timestr;
        },
        addDays: function (time, num) {
            var value = time.valueOf();
            value += 86400000 * num;
            return new Date(value);
        },
        timeFromString: function(s)
        {
            // just 00:59:38 - this is actually a  TimeSpan
            var d,bits = s.split(':');
            d = new Date(0);
            d.setHours(bits[0], bits[1], bits[2]);

            return d;
        },
        dateFromString: function (s) {
            var d, bits;
            if (s === "") {
                // rider not finished, or no time provided - use a max date
                return new Date(this.noTimeYet);
            }
            // format PT1H10M35S - this is actually a  TimeSpan 
            if (s.charAt(0) === 'P') {
                bits = s.split(/[PTHMS]/g);
                d = new Date(0);
                d.setHours(bits[2], bits[3], bits[4]);
                return d;
            }
            // format 2012-07-15T08:00:00+01:00 
            if (s.indexOf("T") > 0) {
                bits = s.split(/[-T:]/g);
                d = new Date(bits[0], bits[1] - 1, bits[2]);
                d.setHours(bits[3], bits[4], bits[5]);

                return d;
            }
            // just 00:59:38 - this is actually a  TimeSpan
            bits = s.split(':');
            d = new Date(0);
            d.setHours(bits[0], bits[1], bits[2]);

            return d;
        },
        log: function (string) {
            var d, timestr;
            d = new Date();
            timestr = timeStringSecs(d);
            timestr += ' ';
            timestr += d.getMilliseconds();
            console.log(timestr + ': ' + string);
        }
    };

}());