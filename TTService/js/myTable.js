
"use strict";

function myTable(tableID, language, array, height, columns, footercallback)
{
    var file = "Rider List";
    var event = EventList.currentEvent;
    if (tableID == "#results" || tableID == "#entries")
        file = Clubs.getName(event.ClubID) + " " + ttTime.dateTimeString(event.Time) + " " + Course.getName(event.CourseID);
    var search = true;
    if (tableID == "#events" || tableID == "#results" || tableID == "#extraresults")
        search = false;

    if (ttApp.isMobile() == false && event != null && (tableID == '#riders' || tableID == '#results' || tableID == '#entries')) {
        // use table tools for printing options
        $(tableID + 'Table').html('<table class="display" id="' + tableID.substring(1) + '"></table>');
        var oTable = $(tableID).DataTable({
            
            "dom": 'T<"clear"><"top"f>rt<"bottom"l>',
            "language": language,
            "scrollY": height,
            "filter": search,
            "tableTools": {
                "sSwfPath": "copy_csv_xls_pdf.swf",
                "aButtons": ["copy", { "sExtends": "pdf", "sTitle": file }]
            },
            "paging": false,
            "scrollCollapse": true,
            "data": array,
            "columns": columns,
            "footerCallback": footercallback
        });
    }

    else {
        $(tableID + 'Table').html('<table class="display" id="' + tableID.substring(1) + '"></table>');
        var oTable = $(tableID).DataTable({
            "dom": '<"top"f>rt<"bottom"l>',
            "language": language,
            "scrollY": height,
            "filter": search,
            //"bjQueryUI": true,
            "paging": false,
            "scrollCollapse": true,
            "data": array,
            "columns": columns,
            "columnDefs": [
                    { "width": "2%", "targets": 0 }
            ],
            "footerCallback": footercallback



        });
    }
    //oTable.aoColumnDefs


    return oTable;
}

function resultsTableRiders(results) {
    var table = myTable('#results', { "sSearch": "Select Rider:" }, results, ttApp.tableHeight(),
        [{ "sTitle": "" },
          { "sTitle": "no:" },
          { "sTitle": "name" },
          { "sTitle": "club" },
          { "sTitle": "time" },
          { "sTitle": "vet+" }],
         null);

    $('#results tbody tr').on('click', function () {
        var nTds, name, rider;
        nTds = $('td', this);
        name = $(nTds[2]).text();
        rider = Riders.riderFromName(name);

        ttApp.changePage("riderDetailsPage");

        rider.displayRider(true);
    });
}

function resultsTableSummary(results,file) {

    $('#extraresultsTable').html('<table class="display" id="extraresults"></table>');

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
        "drawCallback": function (oSettings) {
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