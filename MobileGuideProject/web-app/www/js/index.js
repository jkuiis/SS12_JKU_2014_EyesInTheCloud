//~ global variables
var media;
var client;
var itemTable;
var typeTable;
var categoryTable;
var instructionTable;
var routeTable;
var userTable;

//~ global constants
var DISPLAY_NONE = "display:none;";
var DISPLAY_BLOCK = "display:block;";

var INTERNET_CONN_ERR = "We are sorry, but this application needs your Internet connection turned on!";

//~global functions

function checkLogin(page) {
    if (localStorage.getItem("userId") &&
        "" != localStorage.getItem("userId")) {
        setActivElement(page);
        localStorage.setItem("lastPage", page);
    } else {
        window.location.replace("login.html");
    }
} //checkLogin

function setActivElement(url) {
    elem = $('[href="' + url + '"]').first();
    elem.click(function (e) {
        e.preventDefault();
    });
    elem.addClass("ui-btn-active ui-state-persist");
}

function getPhoneGapPath() {
    'use strict';
    var path = window.location.pathname;
    var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
    return phoneGapPath;
}

function instantiateClient() {
    if (!client) {
        client = new WindowsAzure.MobileServiceClient('https://mobileguide.azure-mobile.net/', 'WFgYDgbJTknoytCvRbjVRRqEpPqwRl79');
    }
}

function createPattern(textID) {
    var text = $(textID).val();

    if (!text || text.length === 0) {
        return new RegExp(".");
    } else {
        return new RegExp("\w*" + text + ".*", "i");
    }
}

function recordPosition(position) {
    localStorage.setItem("lastLatitude", position.coords.latitude);
    localStorage.setItem("lastLongitude", position.coords.longitude);
}

function populate(name, table) {
    var textSTR = "#" + name + "TXT";
    var listSTR = "#" + name + "DL";
    var list = $(listSTR);
    var query = table;

    query.read().then(function (items) {
        //clean the list
        list.html("");
        //populate the list
        var regExp = createPattern(textSTR);
        $.map(items, function (item) {
            //populate the datalist with the items for wich the name match the pattern
            if (regExp.test(item.name)) {
                //alert("name: " + item.name + ", id: " + item.id);
                list.append("<option value='" + item.id + "' description='" + item.description + "'>" + item.name + "</option>");
            }
        });
        //list.listview("refresh");
        list.selectmenu("refresh");
    }, handleError);
}

function handleError() {
    alert("an error was occured!");
}

//~methods for main page
$("#mainPage").on("pageinit", function (event) {
    onMainLoad();
});

function onMainLoad() {
    alert("cut1");
    if (!localStorage.getItem("userId") ||
        "" == localStorage.getItem("userId") ||
        localStorage.getItem("lastPage") == null) {
        localStorage.setItem("lastPage", "login.html");
    } //if

    var online = navigator.onLine;
    var page = localStorage.getItem("lastPage").toString();

    if (online) {
        window.location.replace(page);
    } else {
        alert(INTERNET_CONN_ERR);
    } //if
}
/*
 //~methods for test page
 $( "#testPage" ).live( "pagecreate", function( event) {
 onLoadTest();
 });

 function onLoadTest() {
 setActivElement("test.html");
 $("#vibrateBTN").bind("click", vibrate);
 $("#beepBTN").bind("click", beep);
 $("#singBTN").bind("click", sing);
 $("#stopSingBTN").bind("click", stopSing);
 $("#locateBTN").bind("click", findLocation);

 $( "#msg" ).html("Device is ready");
 lastPage = "test.html";
 }

 //vibrate for half of a second..
 //even iPhone seems to vibrate for this time
 function vibrate() {
 navigator.notification.vibrate(500);
 }

 function beep() {
 navigator.notification.beep(1);
 }

 function sing() {
 media = new Media(getPhoneGapPath() + "media/audio/test.mp3",
 function () {
 //alert("playing");
 },
 function(err) {
 alert("err: " + err.message);
 });
 media.play();
 media.setVolume(0.5);
 }

 function stopSing() {
 media.stop();
 media.release();
 alert("test " + media);
 }

 function findLocation() {
 if ( navigator.geolocation) {
 navigator.geolocation.watchPosition(f, g);
 } else {
 alert("geolocation is not supported");
 }
 }

 function f(position) {
 alert("latitude: " + position.coords.latitude + ", longitude: " + position.coords.longitude);
 }

 function g(error) {
 alert("code: " + error.code + ", message: " + error.message);
 }
 */
