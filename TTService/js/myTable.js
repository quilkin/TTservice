"use strict";

function myTable(tableID, language, array, height, columns, footercallback)
{
    var file = "Rider List";
    if (tableID == "#results" || tableID == "#entries")
        file = Clubs.getName(currentEvent.ClubID) + " " + DateTimeString(currentEvent.Time) + " " + getCourseName(currentEvent.CourseID);
    var search = true;
    if (tableID == "#events" || tableID == "#results" || tableID == "#extraresults")
        search = false;

    if (ttApp.isMobile() == false && currentEvent != null && (tableID == '#riders' || tableID == '#results' || tableID == '#entries')) {
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

// stuff for jquerymobile tables

//// make a simpler array for autocomplete to handle
//// if screen is big enough, include club name in list
//names = new Array(ridersdata.length);
//for (var i = 0; i < ridersdata.length; i++) {
//    var rider = ridersdata[i];
//    if (screenWidth > 500) 
//        names[i] = new Array(rider.Name, rider.Club);
//    else
//        names[i] = new Array(rider.Name);
//}
//$("#riderSearch").autocomplete({
//    target: $("#riderList"),
//    source: names,
//    callback: function (e) {
//        // change to relevant rider's page
//        var a = $(e.currentTarget); // access the selected item
//        var riderText = a.text();
//        var rider;
//        ChangePage("riderDetailsPage");
//        for (var r in ridersdata) {
//            rider = ridersdata[r];
//            if (riderText.indexOf(rider.Name)==0)
//                break;
//        }
//        displayRider(rider,false);
//    },
//    labelHTML: function (rider)
//    {
//        if (screenWidth > 400)
//            return rider[0] + '<span class="ui-li-count">' + rider[1] + '</span></li>';
//        else
//            return rider[0] + '</li>';

//    },
//    //minLength: 0
//    onFocus: true,
//    onMouseUp: true
//});

//$('#entryList').empty();
//$.each(entries, function (index, entry)
//{
//    var date = new Date(entry[1]);
//    var htmlstr = '<li data-name="' + entry.RiderID  +'">' +
//           '<h1><span style="color:red">' + entry[2] + '</span>' + ': ' + entry[0] + '</h1>' +
//           '<span class="ui-li-count">' + TimeString(date) + '</span></li>';
//    $('#entryList').append(htmlstr);
//});
//$('#entryList').delegate('li', 'click', function ()
//{
//    var id = $(this).attr('data-name');
//    var newpage = "#riderDetailsPage";
//    $.mobile.changePage(newpage);
//    var rider = getRiderFromID(id);
//    displayRider(rider,true);
//});
