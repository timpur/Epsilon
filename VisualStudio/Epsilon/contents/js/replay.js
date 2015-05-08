/// <reference path="bootstrap.min.js" />
/// <reference path="jquery-ui.min.js" />
/// <reference path="angular-dragdrop.min.js" />
/// <reference path="angular.min.js" />
/// <reference path="jquery-2.1.3.min.js" />
/// <reference path="epsilon.js" />

var data2play;//this variable contains the sublevel data.
var app = angular.module('replay', []);
var theSession;

$(document).ready(function () {
    SetReplayInfo();//set the replay info from the session (child id, date, ...) 
    $("#replayPanel").draggable();
});


app.run(function ($rootScope) {
    // Add / Change the root for shared objects;

    // This is where image locations and id are located and will be coppeid for use in controllers 
    $rootScope.rootImages = [
        { ID: 1, name: "", src: "contents/images/image4.jpg" },
        { ID: 2, name: "", src: "contents/images/image5.jpg" },
        { ID: 3, name: "", src: "contents/images/image6.jpg" }
    ];
    if (session.Load()) {
        theSession = session.Session;
        var LevelID = GetURLLevelID();//get the id of the specific part of the session to be replayed (sublevel).
        data2play = getData2Play(LevelID);//get the specific part of the session to be replayed (sublevel).
        $rootScope.currentMove = 0;
        $rootScope.lastMove = data2play.Movements.length;
    } else {
        //Problem No Current Session
        window.location = "/error.html?error=404Session";
    }
});

app.controller("mainController", function ($scope, $rootScope) {
    SetReplayInfo = function () {
        if (theSession) {
            $scope.childId = theSession.Child.ID;
            $scope.sessionDate = data2play.StartTime;
            $scope.currentLevel = getSublevelName(data2play.ID);
            $scope.currentMove = $rootScope.currentMove;
            $scope.lastMove = $rootScope.lastMove;
        }
    }
});

app.controller("replayControler", function ($scope, $rootScope) {
    $scope.buttonForwardPress = function () {
        var move = $rootScope.currentMove;
        var lastMove = $rootScope.lastMove;
        if (move < lastMove) {
            playMove(move, "forward");
            $rootScope.currentMove++;
            SetReplayInfo();
        }
    }

    $scope.buttonBackPress = function () {
        var move = $rootScope.currentMove;
        var lastMove = $rootScope.lastMove;
        if (move > 0) {
            move--;
            playMove(move, "reverse");
            $rootScope.currentMove--;
            SetReplayInfo();
        }
    }
});

app.controller("staticImages", function ($scope, $rootScope) {
    $scope.images = orderStaticImgs(createImageFromRoot($rootScope.rootImages));
});

app.controller("replayImages", function ($scope, $rootScope) {
    $scope.OrderImages = function () {
        // This is where the images are heald. Duplicated from root images.
        $scope.images = orderDynamicImgs(createImageFromRoot($rootScope.rootImages));
        // push another object that is empty for the blank space
        $scope.images.push({});
    }
    $scope.OrderImages(); 

    playMove = function (id, direction) {
        var searchImagePos = function (id) {
            for (var i = 0; i < $scope.images.length; i++) {
                if ($scope.images[i].ID == id) {
                    return i;
                }
            }
        };
        var movement = data2play.Movements[id];
        var image = $scope.images[searchImagePos(movement.ImageID)];
        var from = 0;
        var to = 0;
        if (direction == "forward") {
            from = movement.From;
            to = movement.Too;
        }
        else {
            from = movement.Too;
            to = movement.From;
        }
        image.currentLocation = to;
        $scope.images[from - 1] = {};
        $scope.images[to - 1] = image;
    }
});

/*-----------------------------------------------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------------------------------------*/

//gets the id given in the url in the form "replay.html?levelid=1234" if id is 1234
function GetURLLevelID() {
    var params = parseURLParams(window.location.href);
    var id = params["levelid"][0];
    return id;
}

//gets the object that stores the sublevel data, based on the sublevel id.
function getData2Play(id) {
    var data = session.getSubLevel(id);
    if (data) { return data; }
    else { window.location = "/error.html?error=404SublevelId"; }
}

//gets the name of the level and sublevel based on the sublevel id.
function getSublevelName(id) {
    var data = session.getSubLevelName(id);
    if (data) { return data; }
    else { window.location = "/error.html?error=404SublevelId"; }
}

//returns an array in the same order as the sublevel's-static-images initial order.
function orderStaticImgs(imagesArray) {
    var idsArray = data2play.ImageIds.static;
    var returnArray = [];
    for (var i = 0; i < idsArray.length; i++) {
        returnArray.push(getImage(imagesArray, idsArray[i]));
    }
    return returnArray;
}

//returns an array in the same order as the sublevel's-dynamic-images initial order.
function orderDynamicImgs(imagesArray) {
    var idsArray = data2play.ImageIds.dynamic;
    var returnArray = [];
    for (var i = 0; i < idsArray.length; i++) {
        returnArray.push(getImage(imagesArray, idsArray[i]));
    }
    return returnArray;
}

//returns an image object based on its ID.
function getImage(array, id) {
    for (var i=0; i<array.length; i++) {
        if (array[i].ID == id) {
            return array[i];
        }
    }
}

function createImageFromRoot(rootImages) { // This function coppies config from root images to new local instances of an image.
    // Also add other parameters to this local image.
    var images = [];
    for (var i = 0; i < 3; i++) {
        var image = {};
        image.isImage = true;
        image.ID = rootImages[i].ID
        image.name = rootImages[i].name;
        image.src = rootImages[i].src;
        image.startLocation = i + 1;
        image.currentLocation = image.startLocation;
        images.push(image);
    }
    return images;
}
