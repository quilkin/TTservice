/*global jQuery*/

var Popup = (function ($) {

    "use strict";

    var popupCount = 0,
        $popUp,

    // constructor
        Pop = function (title) {

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

    this.addMenuItem = function (text, func, param1, param2) {
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
    };
    this.open = function () {
        // $popUp.popup("open").trigger("create");
        $popUp.popup("open");
    };
    this.alert = function (alertstr) {
        var popup = new Pop(alertstr);
        popup.addMenuItem('OK', null);
        popup.open();
    };
    this.confirm = function (question, yesfunc, nofunc) {
        var popup = new Pop(question);
        popup.addMenuItem('yes', yesfunc);
        popup.addMenuItem('no', nofunc);
        popup.open();
    };
}(jQuery));
