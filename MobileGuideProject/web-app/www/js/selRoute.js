//~ methods for navigation area
var currentRoute;
var instruction;
var index;

$("#searchPage").live("pagecreate", function (event) {
onLoadSearch();
});

function onLoadSearch() {
checkLogin("sel_route.html");

instantiateClient();
itemTable = client.getTable('Item');
routeTable = client.getTable('Route');
instructionTable = client.getTable('Instruction');
alert("cut2");
//mock instruction
instruction = "bypass to right";
$("#nameTXT").on("input", populateRoutes);
$("#startNavigationBTN").on("click", startNavigation);
}

function populateRoutes() {
populate("name", routeTable);
} //populateRoutes

function startNavigation() {
//ask to server for the route..
//step1: for details 
var routeId = $("#nameDL").val();

if (routeId && "" != routeId) {
var query = routeTable.where({ id: routeId});

var routes = new Array(); 
var obj;
query.read().then(function(items) {
$.each(items, function(i, item) {
obj = {id: item.id, name: item.name, description: item.description};
routes.push(obj);
}); //each
});

if ( routes.length === 0) {
alert("invalid route!");
} else {
currentRoute = routes[0];

//step2: for instructions
query = instructionTable.where({ routeId: routeId});

currentRoute.points = new Array();
var point, itm, auxQuery;
query.read().then(function(instructionItems) {
$.each(instructionItems, function(i, instructionItem) {
point = {description: instructionItem.description, order: instructionItem.order};

auxQuery = itemTable.where({id: instructionItem.itemId});
auxQuery.read().then(function(items) {
$.each(items, function(ii, item) {
point.lat= item.latitude;
point.long = item.longitude;
point.popupRad = item.popupRadius;
});
}); //read items

currentRoute.points.push(point);
});//each instruction
});//read instruction

//sort the waypoints according their order field
currentRoute.points = currentRoute.points.sort(function(p1, p2) {
return p1.order - p2.order;
});

if (navigator.geolocation) {
index = 0;
navigator.geolocation.watchPosition(navigate);
} //if
} //if route.length
} else{
alert("You must select a route!");
}//if
} //startNavigation

function navigate(position) {
//when the waypoints of the route are over the watch should be stopped
if (currentRoute && 
currentRoute.points && 
currentRoute.points.length > 0 && 
index == currentRoute.points.length)) {
navigator.geolocation.clearWatch();
} //if

if (currentRoute && currentRoute.points) {
//the index stores the next point from the currentRoute
//check the distance between user location and the location of next point
var cLat = position.coords.latitude;
var cLong = position.coords.longitude;

//compute the euclidean distance
var diffLat = cLat - currentRoute.points[index].lat;
var diffLong = cLong - currentRoute.points[index].long;
var d = Math.sqrt(diffLat * diffLat + diffLong * diffLong);

if ( d <= currentRoute.points[index].popupRad) {
instruction = currentRoute.points[index].description;
createDescription();
index = index + 1;
} //if 
} //if currentRoute
} //navigate

function createDescription() {
//if it doesn't contain "bypass, turn or up|down" replace the 
instruction with "go straight"
var pattern = new RegExp(".*(turn|bypass|up|down|go).*");
if (!pattern.test(instruction)) {
instruction = "go straight";
} //if
$("#descriptionDiv").html(instruction);
navigator.notification.alert( instruction, 
function() {
updateCompase();
},""); //tried to force the title to be empty
} //createDescription

function updateCompase() {
if ( -1 != instruction.indexOf("turn") ) {
var degrees = computeDegrees();
move(degrees);
} else if ( -1 != instruction.indexOf("bypass") ) {
var s = 1;
if ( -1 != instruction.indexOf("left") ) {
s = -1;
} //if

var d = 30;
move(s*d);
var i;
for ( i = 0; i<3; i++) {
setTimeout(function() {
d = d - 10;
move(s*d);
}, 150);
} //for
} //if
} //updateCompase

function computeDegrees() {
//establish the angle
var d = 0;
var index = instruction.indexOf("with");
if (-1 != index ) {
var str = "";
var digit = /[0-9]/g;
var i;
for (i = 0; i< instruction.length - index; i++) {
if ( digit.test(instruction.substr(index+i,1) ) || "-" == instruction.substr(index+i,1) || "." == instruction.substr(index+i,1) ) {
str = str + instruction.substr(index+i,1); 
}
} //for
d = Number(str) != NaN ? Number(str) : 0;
} //if 
if ( -1 != instruction.indexOf("left") ) {
return (-1) * d;
} else if (-1 != instruction.indexOf("right") ) {
return d;
} else {
return 0;
}
} //computeDegrees

function move(degrees) {
var style = "transform:rotate(" + degrees + "deg); -ms-transform:rotate(" + degrees + "deg); -webkit-transform:rotate(" + degrees + "deg);";
var elem = $("#needleIMG");
 elem.removeAttr("style");
elem.attr("style", style);
} //move