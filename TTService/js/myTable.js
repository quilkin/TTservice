﻿
var TTTable = (function ($) {
    "use strict";

    var table,
    ttTable = function (tableID, searchText, array, height, footercallback, allowPrint) {
        var file = "Rider List";

        this.tableDefs = {
            "language": { "search": searchText },
            "scrollY": height,
            "filter": true,
            "paging": false,
            "scrollCollapse": true,
            "data": array,
            "footerCallback": footercallback
        };
        if (tableID === "#results" || tableID === "#entries" || tableID ==="#clubResults") {
            file = EventList.currentEvent().details() + " " + tableID.substring(1);
        }

        if (ttApp.isMobile()) {
            allowPrint = false;
        }
        if (allowPrint) {
            // add print buttons
            this.tableDefs.dom = 'T<"clear"><"top"f>rt<"bottom"l>';
            // use table tools for printing options
            this.tableDefs.tableTools = {
                "sSwfPath": "copy_csv_xls_pdf.swf",
                "aButtons": ["copy", { "sExtends": "pdf", "sTitle": file }]
            };
        }

        $(tableID + 'Table').html('<table class="display" id="' + tableID.substring(1) + '"></table>');

        this.show = function (onclick) {
            // onclick is the function (if any) to be run when a row is clicked
            var defs = this.tableDefs;
            // workaround delay to allow column headers to be resized. Needs a delay after being created, before being shown
            setTimeout(function () {
                table = $(tableID).DataTable(defs);
                $(tableID + ' tbody tr').on('click', function () {
                    var nTds = $('td', this);
                    onclick(nTds,table);
                    //if (tableID === "#clubs" || tableID === "#courses") {
                    //    table.destroy();
                    //}
                });
            }, 200);
        };
        this.settings = function () {
            return table.settings();
        };
        this.search = function () {
            return table.search();
        };
        this.destroy = function () {
            table.destroy();
        };
        this.clear = function () {
            table.clear();
        };
    };


    return ttTable;


}(jQuery));