/*global window,jQuery,popup,ttTime,TTData,Riders,ttApp*/

var login = (function ($) {

"use strict";
    var login = {},
        UserRoles = { None: 0, Viewer: 1, ClubAdmin: 2, FullAdmin: 3 },
        userRole;

    function handleLogin()
    {
        var u,p,creds,form = $("#loginForm");
        //disable the button so we can't resubmit while we wait
        $("#submitButton", form).attr("disabled", "disabled");
        u = $("#username", form).val();
        p = $("#password", form).val();
        //var thisurl = urlBase() + 'Login';
        userRole = 0;

        if (u !== '' && p !== '') {
            creds = { name: u, pw: p, email: "", code: 0 };
            TTData.json('Login', "POST", creds, function (res)
                {
                    if (res > 0) {
                        userRole = res;
                        //if (userRole < 2)
                        //    $(".adminonly").prop("disabled", true);
                        //store
                        window.localStorage.username = u;
                        window.localStorage.password = p;
                        Riders.getRiderData();
                        ttApp.changePage("home");
                        //if (ttApp.isMobile()) {
                        //    $("#deviceid").html(device.model);
                        //}
                    } else {
                        popup.alert("Invalid username or password");
                    }
                    $("#submitButton").removeAttr("disabled");
                }, true);

        } else {
            popup.alert("You must enter a username and password");
            $("#submitButton").removeAttr("disabled");
        }
        return false;
    }

    function checkPreAuth() {
        //   comment out temporarily to test sign-up

        var form = $("#loginForm");
        if (window.localStorage.username !== undefined && window.localStorage.password !== undefined) {
            $("#username", form).val(window.localStorage.username);
            $("#password", form).val(window.localStorage.password);
            handleLogin();
        }
    }
    
    $('#newSignup').click(function () {
        ttApp.changePage("signupPage");
        $("#code").hide();
        $("#lblCode").hide();
    });

    function handleSignup()
    {
        var u,p1,p2,e,c,creds,form = $("#signupForm");
        //disable the button so we can't resubmit while we wait
        $("#submitSignup", form).attr("disabled", "disabled");
        u = $("#username1", form).val();
        p1 = $("#password1", form).val();
        p2 = $("#password2", form).val();
        e = $("#userEmail", form).val();
        c = $("#code", form).val();
        if (c === '') { c = 0; }
    
        if (u !== '' && p1 === p2 && p1 !== '' && e !== '') {
            creds = { name: u, pw: p1, email: e, code: c };
            TTData.json('Signup', "POST", creds, function (res)
            {
                popup.alert(res);
                $("#submitSignup").removeAttr("disabled");
                if (res.substring(0, 2) === "OK") {
                    $("#code").show();
                    $("#lblCode").show();
                }
                if (res.substring(0, 9) === "Thank you")           //"Thank you, you have now registered"
                {
                    userRole = UserRoles.Viewer;
                    //$(".adminonly").prop("disabled", true);
                    Riders.getRiderData();
                    ttApp.changePage("home");

                    //window.addEventListener("batterystatus", onBatteryStatus, false);
                }
            },true);

        } else {
            popup.alert("You must enter a username, password and valid email address");
            $("#submitSignup").removeAttr("disabled");
        }
        return false;
    }


    login.checkRole = function () {
        if (userRole < UserRoles.ClubAdmin) {
            popup.alert("To access this function, please request club-level authorisation by emailing 'admin@timetrials.org.uk'");
            return false;
        }
        return true;
    };
    login.deviceReady = function () {

        $("#loginPage").on("pageinit", function () {
            //       console.log("pageinit run");
            $("#loginForm").on("submit", handleLogin);
            $("#signupForm").on("submit", handleSignup);
            checkPreAuth();
        });

        ttApp.changePage("loginPage");
        if (ttApp.isMobile()) {
            $('#note1').hide();
            $('#note2').hide();
        }
    };


return login;
}(jQuery));