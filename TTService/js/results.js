"use strict";

function Results()
{
 //   var size = screenHeight * 2 / 3;
    if (currentEvent.Entries.length < 1) {
        popup.alert("No event loaded, or no riders in event!");
        return;
    }
    //if (currentEvent.PastEvent()==false) {
    //    popup.alert("No results yet, event has not happened");
    //    return;
    //}
    SortResults();
    var pos = 1;
    var results = new Array();
    $.each(currentEvent.Entries, function (index, entry)
    {
        entry.Position = pos++;
        var r = Riders.riderFromID(entry.RiderID);
        var rider = new Rider(r.ID,r.Name,r.Age,r.Category,r.ClubID,r.Email,r.Best25);
        var stdTime = rider.vetStandardTime(currentEvent.Distance());
        if (stdTime > 0) {
            entry.VetOnStd = entry.Finish - entry.Start - stdTime;
        }
        else
            entry.VetOnStd = 0;
        var rideTimeString;
        var rideTime = entry.Finish - entry.Start;
        if (entry.Finish/1000 == didNotStart/1000) {
            rideTimeString = "DNS";
            entry.VetOnStd = 0;
        }
        else if (entry.Finish/1000 == didNotFinish/1000) {
            rideTimeString = "DNF";
            entry.VetOnStd = 0;
        }
        else if (entry.Finish >= specialTimes)
            return true;          //continue, don't add to list
            //rideTimeString = "???";
        else
            rideTimeString = TimeStringH1(rideTime);
        
        results.push(new Array(entry.Position, entry.Number, rider.Name, ttApp.isMobile() ? Clubs.getAbbr(rider.getClubID()) : Clubs.getName(rider.ClubID), rideTimeString, TimeStringVetStd(entry.VetOnStd)));

    });

    ChangePage("resultpage");
    if (ttApp.isMobile()) {
        $('#btnEmailResult').hide();
    }
    if (checkRole() == false) {
        $('#btnEmailResult').hide();
    }
    var title = Clubs.getName(currentEvent.ClubID) + " " + DateTimeString(currentEvent.Time) + " " + getCourseName(currentEvent.CourseID);
    $('#resultsTitle').text(title);

    var table = myTable('#results', { "sSearch": "Select Rider:" }, results, tableHeight,
        [ { "sTitle": "" },
          { "sTitle": "no:" },
          { "sTitle": "name" },
          { "sTitle": "club" },
          { "sTitle": "time" },
          { "sTitle": "vet+" }],
         null);

    $('#results tbody tr').on('click', function ()
    {
        var nTds = $('td', this);
        var name = $(nTds[2]).text();
        var rider = RiderFromName(name);

         ChangePage("riderDetailsPage");

        displayRider(rider,true);
    });


//}

//// team, junior, women results etc
//function ExtraResults()
//{
//    pos = 1;
    results = new Array();
    $.each(currentEvent.Entries, function (index, entry)
    {
        //entry.Position = pos++;
        var r = Riders.riderFromID(entry.RiderID);
        var rider = new Rider(r.ID, r.Name, r.Age, r.Category, r.ClubID, r.Email, r.Best25);
        var stdTime = rider.vetStandardTime(currentEvent.Distance());
        if (stdTime > 0) {
            entry.VetOnStd = entry.Finish - entry.Start - stdTime;
        }
        else
            entry.VetOnStd = 0;
        var rideTimeString;
        var rideTime = entry.Finish - entry.Start;
        if (entry.Finish / 1000 == didNotStart / 1000) {
            rideTimeString = "DNS";
            entry.VetOnStd = 0;
        }
        else if (entry.Finish / 1000 == didNotFinish / 1000) {
            rideTimeString = "DNF";
            entry.VetOnStd = 0;
        }
        else if (entry.Finish >= specialTimes)
            return true;          //continue, don't add to list
            //rideTimeString = "???";
        else
            rideTimeString = TimeStringH1(rideTime);

        results.push([Clubs.getAbbr(rider.getClubID()), entry.Number, rider.Name, rideTimeString, TimeStringVetStd(entry.VetOnStd)]);

    });

    $('#extraresultsTable').html('<table class="display" id="extraresults"></table>');
    var file = Clubs.getName(currentEvent.ClubID) + " " + DateTimeString(currentEvent.Time) + " " + getCourseName(currentEvent.CourseID);

    var oTable = $('#extraresults').DataTable({
        "data": results,
        "scrollY": 300,
        "paging": false,
        "filter": false,
        "columns": 
          [
          { "title": "no:" },
          { "title": "name" },
          { "title": "club" },
          { "title": "time" },
          { "title": "vet+" }],
        "tableTools": {
            "sSwfPath": "copy_csv_xls_pdf.swf",
            "aButtons": ["copy", { "sExtends": "pdf", "sTitle": file }]
        },
        "drawCallback": function (oSettings)
        {
                if (oSettings.aiDisplay.length == 0) {
                    return;
                }

                var nTrs = $('#extraresults tbody tr');
                var iCol = nTrs[0].getElementsByTagName('td');
                var iColspan = iCol.length;
                var sLastGroup = "";
                for (var i = 0 ; i < nTrs.length ; i++) {
                    var iDisplayIndex = oSettings._iDisplayStart + i;
                    var sGroup = oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[0];
                    if (sGroup != sLastGroup) {
                        var nGroup = document.createElement('tr');
                        var nCell = document.createElement('td');
                        //ncell.colSpan = iColspan;
                        nCell.colSpan = 100;
                        nCell.className = "group";
                        nCell.innerHTML = sGroup;
                        nGroup.appendChild(nCell);
                        nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
                        sLastGroup = sGroup;
                    }
                }
            },


        "aoColumnDefs": [
            { "bVisible": false, "aTargets": [0] }
        ],
        "aaSortingFixed": [[0, 'asc']],
        "aaSorting": [[1, 'asc']],
      //  "sDom": 'lfr<"giveHeight"t>ip'
        "sDom": 'T<"clear"><"top"f>rt<"bottom"l>'
    });


}