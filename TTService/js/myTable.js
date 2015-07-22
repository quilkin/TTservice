
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

        this.show = function () {
            table = $(tableID).DataTable(this.tableDefs);
            table.columns.adjust().draw();
            return table;
        };
        this.settings = function () {
            return table.settings();
        };
        this.search = function () {
            return table.search();
        };
        this.order = function (ordering) {
            table.order(ordering).draw();
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