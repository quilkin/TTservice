"use strict";

var popupCount=0;

function myPopup(title)
{

    if (popupCount > 4) {
        alert("Too many popups");
        popupCount = 0;
        //return null;
    }
    this.$popUp = $("<div class='ui-content'/>").popup({
        dismissible: false,
        theme: "c",

    }).on("popupafterclose", function ()
    {
        $(this).remove();
        if (popupCount > 0)--popupCount;
    });
    $("<h4/>", { text: title }).appendTo(this.$popUp);
    ++popupCount;

    this.addMenuItem = function (text, func, param1, param2)
    {
        var self = this.$popUp;
        $("<a/>", {
            text: text
        }).buttonMarkup({
            inline: true,
            theme: "b"
        }).on("click", function ()
        {
            self.popup("close");
            if (func != null) {
                func(param1, param2);
            }
        }).appendTo(this.$popUp);
    }
    this.open = function ()
    {
        // $popUp.popup("open").trigger("create");
        this.$popUp.popup("open");
    }
}


function myAlert(alertstr)
{
    var popup = new myPopup(alertstr);
    popup.addMenuItem('OK', null);
    popup.open();
}

function myConfirm(question, yesfunc, nofunc)
{
    var popup = new myPopup(question);
    popup.addMenuItem('yes', yesfunc);
    popup.addMenuItem('no', nofunc);
    popup.open();
}
