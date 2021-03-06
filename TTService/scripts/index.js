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
        }, 1000);
        
        
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
        $('#saveRiderData').click(function () { Riders.saveRiderData(null); });

        //$('#addEvRider').prop('disabled', true).addClass('ui-disabled');
        //$('#manage').click(function () {
        //    $('#eventDetails').text(EventList.currentDetails());
        //    ttApp.changePage('eventManage');
        //});
        
        //$('#theday').click(function () { ttApp.changePage('onTheDay'); });
        //$('#ridersclubs').click(function () { ttApp.changePage('ridersClubs'); });

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


        var activePage = $.mobile.activePage.attr('id');
        var event = EventList.currentEvent();

        
        if (activePage === 'startLinePage' && event != null)
        {
            var eventTime = event.getTime();
            var nextRider,
                timeToGo,
                millisecToGo = eventTime - d.valueOf(),
                numRiders = event.Entries.length;

            timeToGo = new Date(millisecToGo);

            if (millisecToGo > 0) {
                $("#nextRider").html('Event starts in...');
                $("#nextRiderTime").html(ttTime.timeString(timeToGo));
            }
            else
            {
                millisecToGo = -millisecToGo;
                //nextRider = -Math.floor(timeToGo.valueOf() / 60000);
                nextRider = Math.floor((millisecToGo) / 60000)+1; // first rider at 1 min past start time 
                millisecToGo = millisecToGo % 60000;
                millisecToGo = 60000 - millisecToGo;
                timeToGo = new Date(millisecToGo);

                //nextRider = - Math.floor(nextRider % numRiders);      // testing only!!
                if (nextRider <= numRiders) {
                    var entry = event.getEntryFromNumber(nextRider);
                    if (entry !== null) {
                        var riderID = entry.RiderID;
                        var rider = Riders.riderFromID(riderID);
                        $("#nextRider").html('Next rider: ' + nextRider + ': ' + rider.Name);
                    }
                    else {
                        var entry = event.getEntryFromNumber(1);
                        if (entry !== null) {
                            var riderID = entry.RiderID;
                            var rider = Riders.riderFromID(riderID);
                            $("#nextRider").html('Next rider: ' + 1 + ': ' + rider.Name);
                        }
                        else {
                            $("#nextRider").html('Next rider: unknown');
                        }
                    }
                }

                else {
                    $("#nextRider").html('No more riders for this event');

                }
                var secs = timeToGo.getSeconds();
                if (secs === 30) {
                    if (ismobile) {
                        var beep = new Media("/android_asset/www/res/beep_mp3.mp3");
                        beep.play();
                    }
                    else {
                        $("#finish")[0].play();
                    }
                }
                else if (secs === 0) {
                    if (ismobile) {
                        var beep = new Media("/android_asset/www/res/censor-beep-4.mp3");
                        beep.play();
                    }
                    else {
                        $("#start4")[0].play();
                    }
                }
                else if (secs <= 5 || secs === 10) {
                    if (ismobile) {
                        var beep = new Media("/android_asset/www/res/censor-beep-01.mp3");
                        beep.play();
                    }
                    else {
                        $("#start1")[0].play();
                    }
                }
                $("#nextRiderTime").html(ttTime.timeString(timeToGo));
            }
 

        }
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

    function enableLink(link, enable) {
        if (enable)
            $(link).prop('disabled', true).removeClass('ui-disabled');
        else
            $(link).prop('disabled', true).addClass('ui-disabled');
    };

    return {
        init: function() {
            //if (ttApp.isMobile())
            //    power = require('powerManagement.js');

            // remove this line while debugging!!!!
            realTimer = setInterval(function () { UpdateTime() }, 1000);
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
            this.enableEventLinks(false);
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

        // Update DOM on a Received Event
        receivedEvent: function(id) {
            var parentElement = document.getElementById(id);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');

        },
        changePage: function (page) {
            var event = EventList.currentEvent();
            // stop updates of results board, if any
            if (event != null && event.ID > 0)
            {
                if (event.displayTimer != null) {
                    clearInterval(event.displayTimer);
                    event.displayTimer = null;
                }
            }
            $("body").pagecontainer("change", "#" + page);
        },
        enableEventLinks: function(enable) {
            return;
            enableLink('#addEvRider', enable);
            enableLink('#saveEvent1', enable);
            enableLink('#saveEvent2', enable);
            enableLink('#displayEvent', enable);
            enableLink('#sortEvent', enable);
            enableLink('#updateEventTimes', enable);
            enableLink('#startLine', enable);
            enableLink('#finLine', enable);
            enableLink('#showResultsList', enable);
            enableLink('#showResultsBoard', enable);
        },
        resetScreenTimeout: function () { screenTimeout = 0;}
    }

}());
