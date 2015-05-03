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
function myInit()
{
    
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/))
        $is_mobile = true;
    //if ($is_mobile)
    //    power = require('powerManagement.js');
    realTimer = setInterval(function () { UpdateTime() }, 1000);
    $.ajaxSetup({ cache: false });

    $(document).on("popupafterclose", ".ui-popup", function ()
    {
        $(this).remove();
    });


    deviceReadyLogin();

}
//function onBatteryStatus(info) {
//    alert("Level: " + info.level + " isPlugged: " + info.isPlugged);
//}

var $is_mobile = false;
var app = {
    
    initMobile: function () {
   //     this.bindEvents();
        $is_mobile = false;
        myInit();

    },
    initNonMobile: function ()
    {
        if ($is_mobile)
            // already done in deviceready
            return;
   //     this.bindEvents();
        myInit();

    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        $.ajaxSetup({ cache: false });
      
        alert("onDeviceReady");
 
    },
   // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');


        //$.ajaxSetup({ cache: false });
    }

};

function detectScreenHeight()
{
    if ($is_mobile) {
        screenHeight = $.mobile.getScreenHeight();
        tableHeight = screenHeight - 100;
        screenWidth = screen.availWidth;
    }
    else{
        tableHeight = window.innerHeight - 175;
        screenHeight = window.innerHeight ;
        screenWidth = window.innerWidth;
    }


};

$(document).ready(function ()
{
 //   $is_mobile = false;

 //   if ($.mobile.media('screen and (max-width: 800px)'))

//    if ($('#mediatest').css('display') == 'none') {
//        $is_mobile = true;
 //   }
    detectScreenHeight();
    document.body.style.backgroundColor = "#FFD700";
});



