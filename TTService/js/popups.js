/*global jQuery*/

var popup = (function ($) {

    "use strict";

    var popupCount = 0,
        $popUp,

    // constructor
        pop = function (title) {

            if (popupCount > 4) {
                this.alert("Too many popups");
                popupCount = 0;
                //return null;
            }
            $popUp = $("<div class='ui-content'/>").popup({
                dismissible: false,
                theme: "c"

            }).on("popupafterclose", function () {
                $(this).remove();
                if (popupCount > 0) { --popupCount; }
            });
            $("<h4/>", { text: title }).appendTo($popUp);
            ++popupCount;
        };
    pop.alert = function (alertstr) {
        var popup = new pop(alertstr);
        popup.addMenuItem('OK', null);
        popup.open();
    };
    pop.confirm = function (question, yesfunc, nofunc) {
        var popup = new pop(question);
        popup.addMenuItem('yes', yesfunc);
        popup.addMenuItem('no', nofunc);
        popup.open();
    };

    pop.prototype = {
        addMenuItem: function (text, func, param1, param2) {
            var self = $popUp;
            $("<a/>", {
                text: text
            }).buttonMarkup({
                inline: true,
                theme: "b"
            }).on("click", function () {
                self.popup("close");
                if (func !== null) {
                    func(param1, param2);
                }
            }).appendTo($popUp);
        },
        open: function () {
            // $popUp.popup("open").trigger("create");
            $popUp.popup("open");
        },


    }
    return pop;
}(jQuery));
