
var TTTable = (function ($) {
    "use strict";

    
    var ttTable = function (tableID, columns, searchText, array, height, footercallback, allowPrint) {
        var table,
            file = "Rider List",
            settings;

        this.tableDefs = {
            "columns" : columns,
            "language": { "search": searchText },
            "scrollY": height,
            "filter": true,
            "paging": false,
            "scrollCollapse": true,
            "data": array,
            "info": false,
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
                if (onclick !== null) {
                    $(tableID + ' tbody').on('click', 'tr',function () {
                        var data = table.row( this ).data();
                        onclick(data, table);
                    });
                }
                settings = table.settings();
            }, 200);
        };
        this.getSettings = function () {
            return settings;
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