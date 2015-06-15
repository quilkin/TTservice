
var TTTable = (function ($) {
    "use strict";

    var table,
        ttTable = {};
    
    ttTable = function (tableID, searchText, array, height, footercallback, allowPrint) {
        var file = "Rider List",
            event = EventList.currentEvent();

        this.tableDefs = {
            "language": { "sSearch": searchText },
            "scrollY": height,
            "filter": true,
            "paging": false,
            "scrollCollapse": true,
            "data": array,
            "footerCallback": footercallback
        };
        if (tableID === "#results" || tableID === "#entries" || tableID=="#extraResults") {
            file = EventList.currentEvent().details();
        }
        if (tableID === "#extraResults") {
            this.tableDefs.aoColumnDefs = [  { "bVisible": false, "aTargets": [0] } ];
            this.tableDefs.aaSortingFixed = [[0, 'asc']];
            this.tableDefs.aaSorting = [[1, 'asc']];
            this.tableDefs.drawCallback = function (oSettings) {
                if (oSettings.aiDisplay.length === 0) {
                    return;
                }

                var nTrs = $('#extraResults tbody tr'),
                    iCol = nTrs[0].getElementsByTagName('td'),
                    iColspan = iCol.length,
                    sLastGroup = "",
                    i;
                for (i = 0 ; i < nTrs.length ; i++) {
                    var iDisplayIndex = oSettings._iDisplayStart + i,
                        sGroup = oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[0];
                    if (sGroup !== sLastGroup) {
                        var nGroup = document.createElement('tr'),
                            nCell = document.createElement('td');
                        //ncell.colSpan = iColspan;
                        nCell.colSpan = 100;
                        nCell.className = "group";
                        nCell.innerHTML = sGroup;
                        nGroup.appendChild(nCell);
                        nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
                        sLastGroup = sGroup;
                    }
                }
            };
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
        else {
            this.tableDefs.columnDefs = [
                { "width": "2%", "targets": 0 }
            ];
        }
        $(tableID + 'Table').html('<table class="display" id="' + tableID.substring(1) + '"></table>');

        this.show = function () {
            table = $(tableID).DataTable(this.tableDefs);
            return table;
        };
        this.settings = function () {
            return table.settings;
        };
        this.order = function () {
            table.order();
        }

    };


    return ttTable;


}(jQuery));