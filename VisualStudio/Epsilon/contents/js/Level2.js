/// <reference path="bootstrap.min.js" />
/// <reference path="jquery-ui.min.js" />
/// <reference path="angular-dragdrop.min.js" />
/// <reference path="angular.min.js" />
/// <reference path="jquery-2.1.3.min.js" />
/// <reference path="epsilon.js" />

// This is where angular functions and dependent functions should go unless common.
var SubLevel = null;
var StartTime = null;
var EndTime = null;
var ImageOrder;
var Sublevels = ["A", "B"]; //sublevels for level 2 (2 sublevels)
var sound1 = new Audio("http://www.freesfx.co.uk/rx2/mp3s/3/4004_1329515672.mp3");
var app = angular.module('epsilon', ['ngDragDrop']);
var randomMessages = ["WOW! You are the best player ever", "Keep it up, I'm proud of you", "You deserve a candy, go ask your mum for one", "Determination is the key to success, Good work!", "Keep up the good work", "I’m impressed of your intelligence", "That deserves an ice-cream"];


$(document).ready(function () {
    if (session.Load()) {
        var SubLevelName = GetURLSubLevelData();
        SetUPSubLevel(SubLevelName);
        SetTitle();
    } else {
        //Problem No Current Session
    }
});

function GetURLSubLevelData() {
    var urldata = parseURLParams(window.location.href);
    var SubLevel = urldata["sublevel"][0];
    return SubLevel;
}

function SetUPSubLevel(Name) {
    Name = String(Name).toUpperCase();
    SubLevel = session.CreateSubLevel(Name);
    DisplaySubLevel();
    SetNumInputs();
}

function SaveSubLevel(Success) {
    // Add SubLevel with all movemments to Session
    EndTime = new Date() // set the end time of level now;
    session.SetSubLevelDetails(SubLevel, StartTime, EndTime, Success);
    session.AddSubLevel(SubLevel, 2);
    session.Save();
}

function addMovement(StartTime, ImageID, From, Too, F) {
    session.AddMovement(SubLevel, session.CreateMovement(StartTime, (new Date()), ImageID, From, Too, F));
}

app.run(function ($rootScope) {
    // Add / Change the root for shared objects;

    // This is where image locations and id are located and will be coppeid for use in controllers 
    $rootScope.rootImages = [
        { ID: 1, name: "", src: "contents/images/image4.jpg" },
        { ID: 2, name: "", src: "contents/images/image5.jpg" },
        { ID: 3, name: "", src: "contents/images/image6.jpg" }
    ];

});

app.controller("mainController", function ($scope, $rootScope) {
    SetTitle = function () {
        $scope.level = "2" + SubLevel.Name.toString().toUpperCase();
        $scope.randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        $scope.$apply();
    }
});

app.controller("staticImages", function ($scope, $rootScope) {
    // This is the controler to control the Static Images
    $scope.images = shuffle(createImageFromRoot($rootScope.rootImages));
    $scope.upDateImageOrder = function () {//updates the global variable called ImageOrder (contains the order of the static images)
        var order = [];
        for (var i = 0; i < $scope.images.length; i++) {
            order.push($scope.images[i].ID);
        }
        SetImageOrder(order);
    }
    $scope.upDateImageOrder();
});
app.controller("moveImages", function ($scope, $rootScope, $filter) {
    DisplaySubLevel = function () {
        $scope.OrderImages();
        $scope.$apply();
    };
    $scope.OrderImages = function () {
        // This is where the images are heald. Duplicated from root images.
        $scope.images = OrderImages($rootScope);
        // push another object that is empty for the blank space
        $scope.images.push({});
    }
    $scope.OrderImages();

    Movement = function (queue) {
        var FindImageBasedOffPos = function (pos) {
            return $scope.images[pos - 1];
        };
        var moveImage = function (imagePos, to) {
            if (imagePos < 1 || imagePos > $scope.images.length) {
                addMovement(new Date(), -1, imagePos, to, true);
                return false;
            }

            var image = FindImageBasedOffPos(imagePos);
            var from = image.currentLocation;

            if (to < 1 || to > $scope.images.length) {
                addMovement(new Date(), image.ID, from, to, true);
                return false;
            }
            
            var newPos = FindImageBasedOffPos(to);
            if (newPos.isImage != true) {
                image.currentLocation = to;
                $scope.images[imagePos - 1] = {};
                $scope.images[to - 1] = image;
                addMovement(new Date(), image.ID, from, to, false);
                return true;
            }
            else {
                addMovement(new Date(), image.ID, from, to, true);
                return false;
            }


        };
        for (var i = 0 ; i < queue.length; i++) {
            var move = queue[i];
            if (moveImage(move.image, move.to)) {
                $scope.CheckImageOrder();
            }
            else {
                alert("Move Filed");
            }
        }
    }

    $scope.CheckImageOrder = function () {
        // Makes an array of ids in the images order
        var order = []
        for (var i = 0; i < ($scope.images.length - 1) ; i++) {
            // This finds the image in the position of (i+1) in the image array
            var image = $scope.images[i];
            var ID = image ? image.ID : -1;
            order.push(ID);
        }
        // Check for success by giving this order to check
        if (CheckForSuccess(order)) {
            // Success
            SaveSubLevel(true);
            gotToNextLevel();
        }
    }

});
app.controller("NumControler", function ($scope, $rootScope) {
    $scope.NumInputs = 0;
    $scope.inputs = [];
    SetNumInputs = function () {
        var SublevelNum = getSublevelNumber();
        var num = 0;
        if (SublevelNum == 0) {
            num = 1;
        }
        else if (SublevelNum == 1) {
            num = 5;
        }
        $scope.NumInputs = num;
        for (var i = 0; i < num; i++) {
            $scope.inputs.push({ select: null, to: null });
        }
    }
    $scope.Go = function () {
        var queue = [];
        for (var i = 0; i < $scope.inputs.length; i++) {
            queue.push({ image: $scope.inputs[i].select, to: $scope.inputs[i].to });
            $scope.inputs[i].select = null;
            $scope.inputs[i].to = null;
        }
        Movement(queue);
    }
});

/*-----------------------------------------------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------------------------------------------*/


function gotToNextLevel() {
    var subLNumber = getSublevelNumber();
    if (subLNumber < Sublevels.length - 1) {
        sound1.play();
        $("#theModal").modal('show');
        $("#theModal").on('hidden.bs.modal', function () {
            window.location = "level2.html?sublevel=" + Sublevels[subLNumber + 1];
        });
    } else {
        $("#modalContent").html("You Have finished level 2");
        $("#theModal").modal('show');
        $("#theModal").on('hidden.bs.modal', function () {
            window.location = "/results.html";
        });
    }
}

//returns 0 if Sublevel is 'a' or 'A', 1 if 'b' or 'B', 2 if 'c' or 'C'
function getSublevelNumber() {
    if (SubLevel) {
        if (String(SubLevel.Name).toUpperCase() == "A") return 0;
        if (String(SubLevel.Name).toUpperCase() == "B") return 1;
        if (String(SubLevel.Name).toUpperCase() == "C") return 2;
    }
    else return 0;
}

function SetImageOrder(order) { // At the start of the game, set the image order in a array containing the ID's in order of position
    ImageOrder = order;
}

function CheckForSuccess(order) {// To check give this function an array containing the order of the curent ID's in there positions
    // check this order to the order of images that are static
    if (order.isEqualTo(ImageOrder)) {
        return true;
    }
    return false;
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

//returns an array of images on the order set according to the game-level
function OrderImages(rootScope) {
    var order = ImageOrder.clone();
    var temp;
    rootImages = rootScope.rootImages;
    if (SubLevel) {
        switch (String(SubLevel.Name).toUpperCase()) {
            case "A": //level 2A shift images to the left
                temp = order.shift();
                order.push(temp);
                break;
            case "B": //level 2B shift images to the right
            default: //there is no level 2C so 2B is also the default-one
                temp = order.pop();
                order.unshift(temp);
                break;
            //default://level 2C reverse order (there is no level 2C for now)
            //    order.reverse();
        }
    }
    //create array of images on the specified order
    var images = [];
    for (var i = 0; i < 3; i++) {
        var image = {};
        var j = order[i] - 1; // some attributes of rootimages[j] are coppied to image[i]
        image.isImage = true;
        image.ID = rootImages[j].ID;
        image.name = rootImages[j].name;
        image.src = rootImages[j].src;
        image.startLocation = i + 1;
        image.currentLocation = image.startLocation;
        images.push(image);
    }
    return images;
}


//shuffle elements in an array
function shuffle(thisArray) {
    var array = thisArray.clone();
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    // Shuffle again if the same
    //if (thisArray.isEqualTo(array))
    //    return shuffle(thisArray);
    for (var i = 0; i < array.length; i++) {
        array[i].startLocation = i + 1;
        array[i].currentLocation = array[i].startLocation;
    }
    return array;
}

//compare if two arrays are equal
Array.prototype.isEqualTo = function (arrayB) {
    var arrayA = this;
    if (arrayA.length != arrayB.length) { return false; }
    else {
        for (i = 0; i < arrayA.length; i++) {
            if (arrayB[i] != arrayA[i]) {
                return false;
            }
        }
        return true;
    }
}

//clone an array
Array.prototype.clone = function () {
    return this.slice(0);
};