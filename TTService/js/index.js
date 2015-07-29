/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

(function () {
    "use strict";
    var currentPage;

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        window.addEventListener('load', function () { FastClick.attach(document.body); }, false);
        //ttApp.receivedEvent('deviceready');
        $.ajaxSetup({ cache: false });
      
        ttTime.log(device.platform + ": " + device.model);
        ttApp.setMobile(true);
        // needs doing again

        ttApp.setPlatform(device.platform);
        //document.addEventListener("backbutton", onBackKeyDown, false);
    }

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    $(document).ready(function () {
        setTimeout(function () {
            // workaround to allow OnDeviceReady to fire???
            ttApp.init();
        },1000)
        
        
        $(document).ajaxStart(function () {
            $('<div class="loader" id="loading"><img id="loading-image" src="images/page-loader.gif" alt="waiting..." /></div>')
        .prependTo('body');
        });

        $(document).ajaxStop(function () {
            // $('.loader').hide();
            $('.loader').remove();
        });
        $(document).bind("mobileinit", function () {
            $.mobile.page.prototype.options.addBackBtn = true;
            $.mobile.defaultPageTransition = 'none';
            $.mobile.pushStateEnabled = false;
        });
        document.body.style.backgroundColor = "#FFD700";

        $('#getRiderData').click(function () {   Riders.getRiderData();    });
        $('#saveRiderData').click(function () {  Riders.saveRiderData(null);   });
        $('#manage').click(function () {
            $('#eventDetails').text(EventList.currentDetails());
            ttApp.changePage('eventManage');
        });
        
        $('#theday').click(function () { ttApp.changePage('onTheDay'); });
        $('#ridersclubs').click(function () { ttApp.changePage('ridersClubs'); });

    });

    //Array.prototype.forEach2 = function (a) {
    //    var l = this.length;
    //    for (var i = 0; i < l; i++) a(this[i], i)
    //}
})();



var ttApp = (function () {
    "use strict";

    var ttApp = {},
    ismobile = false,
    realTimer,
    screenTimeout,
    platform;
    
    function UpdateTime() {
        var d = new Date();
        $(".realtime").text(ttTime.timeString(d));

        if (ismobile) {
            // extend sleep timeout to 5 minutes
            ++screenTimeout;
            if (screenTimeout == 1) {
                chrome.power.requestKeepAwake("display");
            }
            if (screenTimeout == 300) {
                chrome.power.releaseKeepAwake();
            }
        }
    }


    return {
        init: function() {
            //if (ttApp.isMobile())
            //    power = require('powerManagement.js');

            // remove this line while debugging!!!!
            //realTimer = setInterval(function () { UpdateTime() }, 1000);
            $.ajaxSetup({ cache: false });

            $(document).on("popupafterclose", ".ui-popup", function ()
            {
                $(this).remove();
            });

            login.deviceReady();

            $('#manual').click(function () {
                window.open('http://timetrials.org.uk/tt-app-help.pdf', '_system');
            });
            $('#googlegroup').click(function () {
                window.open('http://groups.google.com/forum/embed/?place=forum/timetrials', '_system');
            });

        },

        setPlatform: function (x) { platform = x; },
        getPlatform: function () {
            return (platform === undefined ? '' : platform);
        },
        isMobile: function () { return ismobile; },
        setMobile: function (x) { ismobile = x; },
        tableHeight: function () {
            if (ismobile) {
                return $(window).height() - 175;
            }
            else {
                return $(window).height() - 175;
            }
        },
        screenHeight: function () {
            if (ismobile) {
                return  $(window).height();
            }
            else {
                return  $(window).height();
            }
        },
        screenWidth: function () {

            if (ismobile) {
               return  $(window).width();
            }
            else {
                return $(window).width();
            }
        },
        setEvent: function (value) { event = value; },
        currentEvent: function() { return event;},
        // Update DOM on a Received Event
        receivedEvent: function(id) {
            var parentElement = document.getElementById(id);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');

        },
        changePage: function (page) {
            //if (popup.prototype.count() > 0)
            //{
            //    return;
            //}
            //$.mobile.changePage("#" + page);
            //ttApp.changePage("" + page);
            //$("body").pagecontainer("change", "#" + page, { transition: "slide" });
            $("body").pagecontainer("change", "#" + page);
        },
        resetScreenTimeout: function () { screenTimeout = 0;}
    }

}());
