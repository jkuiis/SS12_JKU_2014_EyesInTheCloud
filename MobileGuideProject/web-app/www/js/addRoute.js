//~ variables used to controll the interface
var activeMode = "#nameDiv";//the active mode for the select item area
var step;

//~ variables for db
var newRoute;

$("#addPage").live("pagecreate", function (event) {
    onLoadAdd();
});

function onLoadAdd() {
    checkLogin("add_route.html");

    newRoute = new Object();
    newRoute.points = new Array();

    instantiateClient();
    routeTable = client.getTable("Route");
    instructionTable = client.getTable("Instruction");
    itemTable = client.getTable('Item');
    typeTable = client.getTable('Type');
    categoryTable = client.getTable('Category');

    populate("type", typeTable);
    populateWithVisiblePoints();
    step = 1;
    $("#stepDiv").html("Step 1 of 3");
    $("#nextBTN").html("Add way points");
    $("#modeSEL").on("change", toggleSelection);
    $("#prevBTN").on("click", goPrev);
    $("#nextBTN").on("click", goNext);

    $("#pointsTXT").on("input", populateItems);
    $("#typeDL").on("change", updateCategory);
}

function populateWithVisiblePoints() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(recordPosition);
    } //if

    var list = $("#visiblePointsDL");

    var query = itemTable;

    query.read().then(function (items) {
        //clean the list
        list.html("");

        //repopulate the list
        $.each(items, function (i, item) {
            var cLat = Number(localStorage.getItem("lastLatitude"));
            var cLong = Number(localStorage.getItem("lastLongitude"));
            var dLat = cLat - item.latitude;
            var dLong = cLong - item.longitude;
            //euclidean distance
            var d = Math.sqrt((dLat * dLat) + (dLong * dLong));

            if (d < item.visibilityRadius) {
                list.append("<option value='" + item.id + "' description='" + item.description + "'>" + item.name + "</option>");
            } //if
        });//each
        //list.listview("refresh");
        list.selectmenu("refresh");
    }, function (err) {
        alert("error: " + err);
    });
} //populateWithVisiblePoints

//toggle the divs according with the selected option
function toggleSelection() {
//take the selected option
    var selectedMode = "#" + $("#modeSEL").val();
    if (selectedMode != activeMode) {
        $(activeMode).toggle();
        $(selectedMode).toggle();
        activeMode = selectedMode;
    }
} //toggleSelection

function goPrev() {
//only in the third section the "previous" button is visible
    addNewInstruction();
    clearFields();

//toggle the divs
    $("#step3").toggle();
    $("#step2").toggle();

//update the footer
    step = 2;
    $("#stepDiv").html("Step 2 of 3");
    $("#prevDiv").toggle();
    $("#nextBTN").html("");
    $("#nextBTN").html("Add instruction");

    populate("points", itemTable);
    updateCategory();
} //goPrev

function goNext() {

    var prevElem = $("#prevDiv");
    var nextElem = $("#nextBTN");
    var stepElem = $("#stepDiv");

//switch for each value of step
//and update specificly the interface

    switch (step) {
        case 1:
            addNewRoute();
            clearFields();

//toggle the divs
            $("#step1").toggle();
            $("#step2").toggle();

//update the footer
            step = 2;
            stepElem.html("Step " + step + " of 3");
            nextElem.html("");
            nextElem.html("Add instruction");

//repopulate the lists
            populate("points", itemTable);
            updateCategory();

            break;
        case 2:
            addPoint();
            clearFields();

//toggle the divs
            $("#step2").toggle();
            $("#step3").toggle();

//update the footer
            step = 3;
            stepElem.html("Step " + step + " of 3");
            prevElem.toggle();
            nextElem.html("");
            nextElem.html("Done");

            break;
        default: //go next from the last page
            addNewInstruction();
            clearFields();

            newRoute = new Object();
            newRoute.points = new Array();

//toggle the divs
            $("#step3").toggle();
            $("#step1").toggle();

//update the footer
            prevElem.toggle();
            step = 1;
            stepElem.html("Step " + step + " of 3");
            nextElem.html("");
            nextElem.html("Add way points");
    } //switch
} //goNext

function clearFields() {
    $("#routeNameTXT").val("");
    $("#routeDescriptionTXT").val("");

    $("#pointsTXT").val("");
    $("#itemNameTXT").val("");
    $("#itemDescriptionTXT").val("");

    $("#instructionNameTXT").val("");
    $("#instructionDescriptionTXT").val("");
} //clearFields

function addPoint() {
    if (activeMode === "#nameDiv") {
        var options = $('#pointsDL');
        var pointElem = $('option:selected', options);
        // var pointElem = $("#pointsDL").children("option").is("selected");
        var id, name, description;
        id = pointElem.val();
        name = pointElem.text();
        description = pointElem.attr("description");

        var point = { id: id, name: name, description: description};
        // point.new = false;
//ToDo: take also category and type ids
        newRoute.points.push(point);
    } else if (activeMode === "#neiDiv") {
        var options = $('#visiblePointsDL');
        var pointElem = $('option:selected', options);

        var id = pointElem.val();
        var name = pointElem.text();
        var description = pointElem.attr("description");
        var point = { id: id, name: name, description: description};
//ToDo: take the category and type ids
        // point.new = false;e.children.item(1)
        newRoute.points.push(point);
    } else {
        addNewItem();
    }
} //addPoint

function addNewItem() {
    var newItem;

    var lat = 0;
    var long = 0;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(recordPosition);
        lat = localStorage.getItem("lastLatitude");
        long = localStorage.getItem("lastLongitude");
    } //if

    var name = $("#itemNameTXT").val();
    var description = $("#itemDescriptionTXT").val();
    var visibilityRad = 100; //meters
    var popupRad = 10; //meters
    var userId = localStorage.getItem("userId");
    var categoryId = $("#categoryDL").val();

    newItem = { name: name, description: description, visibilityRadius: visibilityRad, popupRadius: popupRad, latitude: lat, longitude: long, userId: userId, categoryId: categoryId};

    itemTable.insert(newItem).done(function (item) {
        itemTable = client.getTable("Item");
        newItem.id = item.id;
        newItem.new = true;
        newRoute.points.push(newItem);
    }, function (err) {
        alert("error: " + err);
    });

} //addNewItem

function addNewRoute() {

    var name = $("#routeNameTXT").val();
    var description = $("#routeDescriptionTXT").val();
    var userId = localStorage.getItem("userId");

//ToDo: validate the values

    var route = { name: name, description: description, userId: userId};
    routeTable.insert(route).done(function (item) {
        routeTable = client.getTable("Route");
        newRoute.id = item.id;
        newRoute.name = item.name;
        newRoute.description = item.description;
    }, function (err) {
        alert("error: " + err);
    });
} //addNewRoute

function addNewInstruction() {

    var name = $("#instructionNameTXT").val();
    var description = $("#instructionDescriptionTXT").val();

//ToDo: validate values;
    var routeId = newRoute.id;
    var itemId = newRoute.points[newRoute.points.length - 1].id;
    var userId = localStorage.getItem("userId");
    var order = newRoute.points.length;

    var instruction = {name: name, description: description, routeId: routeId, itemId: itemId, userId: userId, order: order};
    instructionTable.insert(instruction).done(function (item) {
        instructionTable = client.getTable("Instruction");
        newRoute.points[newRoute.points.length - 1].instructionId = item.id;
    }, function (err) {
        alert("error: " + err);
    });
} //addNewInstruction


function populateItems() {
    populate("points", itemTable);
} //populateItems

function updateCategory() {
    var typeId = $("#typeDL").val();
    var query = categoryTable.where({ typeId: typeId});
    var list = $("#categoryDL");

    query.read().then(function (items) {
        //clean the list
        list.html("");
        $.map(items, function (item) {
            list.append("<option value='" + item.id + "' description='" + item.description + "'>" + item.name + "</option>");
        });
        list.selectmenu("refresh");
    }, function (err) {
        alert("error: " + err);
    });
}