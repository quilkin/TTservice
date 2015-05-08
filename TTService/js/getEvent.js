"use strict";

function dateFromString(s) {
    if (s == "")
        // rider not finished, or no time provided - use a max date
        return new Date(noTimeYet);
    // format PT1H10M35S - this is actually a  TimeSpan 
    if (s.charAt(0) == 'P') {
        var bits = s.split(/[PTHMS]/g);
        var d = new Date(0);
        d.setHours(bits[2], bits[3], bits[4]);
        return d;
    }
    // format 2012-07-15T08:00:00+01:00 
    if (s.indexOf("T") > 0) {
        var bits = s.split(/[-T:]/g);
        var d = new Date(bits[0], bits[1] - 1, bits[2]);
        d.setHours(bits[3], bits[4], bits[5]);

        return d;
    }
    // just 00:59:38 - this is actually a  TimeSpan
    var bits = s.split(':');
    var d = new Date(0);
    d.setHours(bits[0], bits[1], bits[2]);

    return d;

}

function timeFromString(s)
{
    // just 00:59:38 - this is actually a  TimeSpan
    var bits = s.split(':');
    var d = new Date(0);
    d.setHours(bits[0], bits[1], bits[2]);

    return d;
}

function pad2(num)
{
    var s = "00" + num;
    return s.substr(s.length - 2);
}

function TimeString(t)
{
    // toLocaleTimeString() is no good for different platforms
    var time = new Date(t);
    var timestr = [pad2(time.getHours()), pad2(time.getMinutes()), pad2(time.getSeconds())].join(':');
    return timestr;
}
function TimeStringH1(t)
{
    // showing only one digit for Hour
    var time = new Date(t);
    var timestr = [time.getHours(), pad2(time.getMinutes()), pad2(time.getSeconds())].join(':');
    return timestr;
}

function TimeStringVetStd(t)
{
    if (t == 0)
        return "";
    var minus = false;
    if (t < 0) {
        t = -t;
        minus = true;
    }
    // showing only mins and secs, and + or - as appropriate
    var time = new Date(t);
    var timestr = [pad2(time.getMinutes()), pad2(time.getSeconds())].join(':');
    if (minus) timestr = '-' + timestr; else timestr = '+' + timestr;
    return timestr;
}
function DateTimeString(t)
{
    // toLocaleTimeString() is no good for different platforms
    var time = new Date(t);
    var datestr = [time.getFullYear(), pad2(time.getMonth() + 1), pad2(time.getDate())].join('-');
    var timestr = [pad2(time.getHours()), pad2(time.getMinutes())].join(':');
    return datestr + " " + timestr;
}

function SortEntries() {

        // compares entries and sorts in order of start, but with those already finished shifted to the end
    currentEvent.Entries.sort(function (a, b) {
        // time will be noTimeYet if rider hasn't started

        //var aFinished = a.Finish.valueOf() / 1000 < noTimeYet / 1000;
        //var bFinished = b.Finish.valueOf() / 1000 < noTimeYet / 1000;
        //if (aFinished & !bFinished)
        //    return b.Start - a.Finish.valueOf() ;
            
        //else if (bFinished & !aFinished)
        //    return a.Start - b.Finish.valueOf();
        //else
        //    if (bFinished & aFinished)
        //        return b.Finish.valueOf() - a.Finish.valueOf();
        //var result = 0;
        //var aFinished = (a.Finish / 1000) < (noTimeYet / 1000);
        //var bFinished = (b.Finish / 1000) < (noTimeYet / 1000);
        //if (aFinished & !bFinished)
        //    result = b.Start - a.Finish;
        //    //return b.Finish;

        //else if (bFinished & !aFinished)
        //    result = a.Start - b.Finish;
        //    //return a.Finish;
        //else
        //    if (bFinished & aFinished)
        //        result = b.Finish - a.Finish;
        //        //return b.Finish - a.Finish;
        ////var result = (b.Finish.valueOf()/1000 > noTimeYet/1000) - (a.Finish.valueOf()/1000 > noTimeYet/1000);
        ////if (result != 0)
        ////    return result;
        //else
        //        result = a.Start - b.Start;
        //return result;
        var result = b.Finish - a.Finish;
        if (result != 0)
            return result;
        return a.Number - b.Number;
    });
    }
function SortResults() {
    // compares entries and sorts in order of result time, lowest first
        currentEvent.Entries.sort(function (a, b) {
            var result = (a.Finish-a.Start) - (b.Finish-b.Start) 
            if (result != 0)
                return result;
            return a.Number - b.Number;
        });

}







