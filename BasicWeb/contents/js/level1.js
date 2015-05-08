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
var Sublevels = ["A", "B", "C"]; //sublevels for level 1 (3 sublevels)
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
}

function SaveSubLevel(Success) {
    // Add SubLevel with all movemments to Session
    EndTime = new Date() // set the end time of level now;
    session.SetSubLevelDetails(SubLevel, StartTime, EndTime, Success);
    session.AddSubLevel(SubLevel, 1);
    session.Save();   
}

function addMovement(StartTime, ImageID, From, Too) {
    session.AddMovement(SubLevel, session.CreateMovement(StartTime, (new Date()), ImageID, From, Too));
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
    SetTitle = function() {
        $scope.level = "1" + SubLevel.Name.toString().toUpperCase();
        $scope.randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        $scope.$apply();
    }
});

app.controller("content", function ($scope, $rootScope) {
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
app.controller("dragableImages", function ($scope, $rootScope, $filter) {
    // This is the controller to control the dragable images   
    DisplaySubLevel = function () {
        $scope.OrderImages();
        $scope.$apply();
    };
    $scope.OrderImages = function () {
        // This is where the images are heald. Duplicated from root images.
        $scope.images = OrderDraggableImages($rootScope);
        // push another object that is empty for the blank space
        $scope.images.push({});
    }
    $scope.OrderImages();
    // On drop event.
    // Finds the droped image and the target location and logs those details.
    $scope.onDrop = function (event, data) {
        var itemDroped = data.draggable[0];
        // get the index of the image that was droped
        var index = $(itemDroped).attr("data-index");
        if (!index == "" || !index) {
            // turn index into number
            index = Number(index);
            // set "itemDroped" to actual object in array
            itemDroped = $scope.images[index];

            // get from location which is the current location
            var From = itemDroped.currentLocation;
            // get the new location from the target. add one because is index and locations start from 1 to n
            var To = Number($(event.target).attr("data-index")) + 1;

            // create history object and add to images history array
            addMovement($scope.CurentDragImage.Time, itemDroped.ID, From, To);
            // update the current location to new location
            itemDroped.currentLocation = To;
            // update the currnte image state to droped (1)
            $scope.CurentDragImage.state = 1;
            // disable the new location for dropable
            $(event.target).droppable("disable");
            // enable the old dropable location as it is now a vacant spot 
            $(data.draggable[0]).parent().droppable("enable");

            // Check of success every drop end
            $scope.CheckImageOrder();
        }

    };

    $scope.CheckImageOrder = function () {
        // Makes an array of ids in the images order
        var order = []
        for (var i = 0; i < ($scope.images.length - 1) ; i++) {
            // This finds the image in the position of (i+1) in the image array
            var image = $filter('filter')($scope.images, { currentLocation: (i + 1) }, true)[0];
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
    $scope.CurentDragImage = { item: null, state: null };
    $scope.FailDropTimer = null;
    $scope.onStart = function (event, data) {
        // Records the image that is currently being draged.
        // This is so that we can detect when image is not droped in correct locations.
        var itemDrag = data.helper[0];
        // get the index of the image that is being draged
        var index = $(itemDrag).attr("data-index");
        if (!index == "" || !index) {

            if (StartTime == null) StartTime = new Date(); // Set the Start Time of Level with First Move

            index = Number(index);
            itemDrag = $scope.images[index];
            $scope.CurentDragImage.item = itemDrag;
            $scope.CurentDragImage.state = 0;
            $scope.CurentDragImage.Time = new Date();
        }
    }
    $scope.onStop = function (event, data) {
        // Wait abit of time to see if drop event changes the state from 0 to 1 other wise image was not droped succesfully.
        // Add a history item to log fail drop
        $scope.FailDropTimer = setTimeout(function () {
            if ($scope.CurentDragImage.state == 0) {
                addMovement($scope.CurentDragImage.Time, $scope.CurentDragImage.item.ID, $scope.CurentDragImage.item.currentLocation, $scope.CurentDragImage.item.currentLocation);
            }
        }, 10);
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
            window.location = "level1.html?sublevel=" + Sublevels[subLNumber + 1];
        });
    } else {
        $("#modalContent").html("You Have finished level 1");
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
        image.index = i;
        image.startLocation = i + 1;
        image.currentLocation = image.startLocation;
        image.history = [];
        images.push(image);
    }
    return images;
}

//returns an array of images on the order set according to the game-level
function OrderDraggableImages(rootScope) {
    var order = ImageOrder.clone();
    var temp;
    rootImages = rootScope.rootImages;
    if (SubLevel) {
        switch (String(SubLevel.Name).toUpperCase()) {
            case "A": //level 1A shift images to the left
                temp = order.shift();
                order.push(temp);
                break;
            case "B": //level 1B shift images to the right
                temp = order.pop();
                order.unshift(temp);
                break;
            default://level 1C reverse order
                order.reverse();
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
        image.index = i;
        image.startLocation = i + 1;
        image.currentLocation = image.startLocation;
        image.history = [];
        images.push(image);
    }
    return images;
}


function createImageMovement(from, to) {
    // this function creates a hitory object
    var item = {};
    item.type = "Movement";
    item.typeid = 1;
    item.from = "Location " + from;
    item.to = "Location " + to;
    item.datetime = new Date();
    return item
}

function createImageFailMovement() {
    // this function creates a hitory object
    var item = {};
    item.type = "Fail Drop";
    item.typeid = 2;
    item.info = "Image Fail to Drop";
    item.datetime = new Date();
    return item
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
        array[i].index = i;
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