//~methods for login page
var activeLoginMode = "#signInDiv";

$("#loginPage").live("pagecreate", function (event) {
    onLoadLogin();
});

function onLoadLogin() {
    setActivElement("login.html");

    instantiateClient();
    userTable = client.getTable('User');

    if (localStorage.getItem("userId") && "" != localStorage.getItem("userId")) {
        toggleLogin("#signOutDiv");
    } //if

    $("#signInBTN").on("click", signin);
    $("#signUpBTN").on("click", signup);
    $("#submitBTN").on("click", submit);
    $("#signOutBTN").on("click", signout);
}

function toggleLogin(currentMode) {
    $(activeLoginMode).toggle();
    $(currentMode).toggle();
    activeLoginMode = currentMode;
} //toggleLogin

function signin() {

    var email = $("#emailInTXT").val();
    var pass = $("#passInTXT").val();
    if ((!email || "" == email) ||
        (!pass || "" == pass)) {
        alert("The email or password fields are empty!");
        return;
    } //if

//ToDo: validate values
    var query = userTable.where({ email: email, password: pass});

    query.read().then(function (items) {
        $.each(items, function (i, item) {
            if (items.length > 0) {
                localStorage.setItem("userId", items[0].id);
                localStorage.setItem("userName", items[0].email);
            } else {
                localStorage.setItem("userId", "");
                alert("Invalid email or password!");
            } //if
        });
    }, handleError);
    if (localStorage.getItem("userId") && "" != localStorage.getItem("userId")) {
        $("#infoP").html("You are currently loged in as " + localStorage.getItem("userName"));
        toggleLogin("#signOutDiv");
    }//if
} //signin

function signup() {
    toggleLogin("#signUpDiv");
} //signup

function submit() {
    var name = $("#nameTXT").val();
    var nickName = $("#nickNameTXT").val();
    var email = $("#emailUpTXT").val();
    var pass = $("#passUpTXT").val();
    var checkPass = $("#passTXT").val();

//ToDo: validate the values

    var user = {name: name, nickName: nickName, email: email, password: pass};

    userTable.insert(user).done(function (item) {
        userTable = client.getTable("User");
    }, function (err) {
        alert("error: " + err);
    });

    toggleLogin("#signInDiv");
} //submit

function signout() {
    localStorage.setItem("userId", "");
    localStorage.setItem("userName", "");
    toggleLogin("#signInDiv");
} //signout