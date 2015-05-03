"use strict";


function checkPreAuth()
{
  //   comment out temporarily to test sign-up

    var form = $("#loginForm");
    if (window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
        $("#username", form).val(window.localStorage["username"]);
        $("#password", form).val(window.localStorage["password"]);
        handleLogin();
    }
}
function checkRole()
{
    if (userRole < UserRoles.ClubAdmin) {
        myAlert("To access this function, please request club-level authorisation by emailing 'admin@timetrials.org.uk'");
        return false;

    }
    return true;
}
function handleLogin()
{
    var form = $("#loginForm");
    //disable the button so we can't resubmit while we wait
    $("#submitButton", form).attr("disabled", "disabled");
    var u = $("#username", form).val();
    var p = $("#password", form).val();
    //var thisurl = urlBase() + 'Login';
    userRole = 0;

    if (u != '' && p != '') {
        var creds = { name: u, pw: p, email: "", code: 0 };
        myJson('Login', "POST", creds, function (res)
            {
                if (res > 0) {
                    userRole = res;
                    //if (userRole < 2)
                    //    $(".adminonly").prop("disabled", true);
                    //store
                    window.localStorage["username"] = u;
                    window.localStorage["password"] = p;
                    GetRiderData();
                    ChangePage("home");
                    if ($is_mobile) {
                        $("#deviceid").html(device.model);
                    }
                } else {
                    myAlert("Invalid username or password");
                }
                $("#submitButton").removeAttr("disabled");
            }, true);

    } else {
        myAlert("You must enter a username and password");
        $("#submitButton").removeAttr("disabled");
    }
    return false;
}
function SignUp()
{
    ChangePage("signupPage");
    $("#code").hide();
    $("#lblCode").hide();
}
function handleSignup()
{
    var form = $("#signupForm");
    //disable the button so we can't resubmit while we wait
    $("#submitSignup", form).attr("disabled", "disabled");
    var u = $("#username1", form).val();
    var p1 = $("#password1", form).val();
    var p2 = $("#password2", form).val();
    var e = $("#userEmail", form).val();
    var c = $("#code", form).val();
    if (c == '') c = 0;
    
    if (u != '' && p1 == p2 && p1 != '' && e != '') {
        var creds = { name: u, pw: p1, email: e, code: c };
        myJson('Signup', "POST", creds, function (res)
        {
            myAlert(res);
            $("#submitSignup").removeAttr("disabled");
            if (res.substring(0, 2) == "OK") {
                $("#code").show();
                $("#lblCode").show();
            }
            if (res.substring(0, 9) == "Thank you")           //"Thank you, you have now registered"
            {
                userRole = UserRoles.Viewer;
                //$(".adminonly").prop("disabled", true);
                GetRiderData();
                ChangePage("home");

                //window.addEventListener("batterystatus", onBatteryStatus, false);
            }
        },true);

    } else {
        myAlert("You must enter a username, password and valid email address");
        $("#submitSignup").removeAttr("disabled");
    }
    return false;
}
function deviceReadyLogin()
{

    $("#loginPage").on("pageinit", function ()
    {
 //       console.log("pageinit run");
        $("#loginForm").on("submit", handleLogin);
        $("#signupForm").on("submit", handleSignup);
        checkPreAuth();
    });
  //  $(document).live("pagebeforechange", function(e, ob) {

  ////      console.log("pagebeforechange");

  ////      console.log(ob);
  //      if (ob.toPage[0].id === "loginPage" && ob.options.fromPage) {
  //          console.log("blocking the back");
  //          e.preventDefault();
  //          history.go(1);
  //      }
  //  });
    ChangePage("loginPage");
    if ($is_mobile) {
        $('#note1').hide();
        $('#note2').hide();
    }
}