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
        ttApp.receivedEvent('deviceready');
        $.ajaxSetup({ cache: false });
      
        ttTime.log(device.platform + ": " + device.model);
        ttApp.setMobile(true);
        // needs doing again
        //bleApp.detectScreenHeight();

        ttApp.SetPlatform(device.platform);
    }

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);


    $(document).ready(function () {

        ttApp.init();
        
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
    });


})();



var ttApp = (function () {
    "use strict";

    var ttApp = {},
    ismobile,
    platform;
    
    return {
        init: function() {
            //ismobile = false;
            //if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/))
            //    is_mobile = true;
            //if (ttApp.isMobile())
            //    power = require('powerManagement.js');
            realTimer = setInterval(function () { UpdateTime() }, 1000);
            $.ajaxSetup({ cache: false });

            $(document).on("popupafterclose", ".ui-popup", function ()
            {
                $(this).remove();
            });

            deviceReadyLogin();

        },

        //initMobile: function () {
        //    //     this.bindEvents();
        //    ismobile = false;
        //    myInit();

        //},
        //initNonMobile: function ()
        //{
        //    if (ismobile)
        //        // already done in deviceready
        //        return;
        //    //     this.bindEvents();
        //    myInit();

        //},
        setPlatform: function (x) { platform = x; },
        getPlatform: function () {
            return (platform === undefined ? '' : platform);
        },
        isMobile: function () { return ismobile; },
        setMobile: function (x) { ismobile = x; },
        tableHeight: function () {
            var tableHeight, screenHeight;
            //bleApp.detectScreenHeight = function () {
            if (ismobile) {
                screenHeight = $(window).height();
                tableHeight = screenHeight - 175;
                //screenWidth = $(window).width();
                //    this.screenWidth = screen.availWidth;
            }
            else {
                screenHeight = $(window).height();
                tableHeight = screenHeight - 175;
                //screenWidth = $(window).width();
                //    this.tableHeight = window.innerHeight - 175;
                //    this.screenHeight = window.innerHeight;
                //    this.screenWidth = window.innerWidth;
            }
            return tableHeight; 
        },

        // Update DOM on a Received Event
        receivedEvent: function(id) {
            var parentElement = document.getElementById(id);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');

        }
    }

}());
