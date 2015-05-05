/// <reference path="bootstrap.min.js" />
/// <reference path="jquery-ui.min.js" />
/// <reference path="angular-dragdrop.min.js" />
/// <reference path="angular.min.js" />
/// <reference path="jquery-2.1.3.min.js" />
/// <reference path="epsilon.js" />

var app = angular.module('results', []);
var theSession;

app.run(function ($rootScope) {
    session.Load();
});

app.controller("mainController", function ($scope, $rootScope) {
    theSession = session.Session;
    theSession.levels

    $scope.session = theSession;

    $scope.Date = function (s) {
        var d = new Date(s);
        return d.valueOf();
    };
    $scope.TimeDiff = function (t1, t2) {
        t1 = new Date(t1);
        t2 = new Date(t2);

        var d = t2.valueOf() - t1.valueOf();
        return d;
    };
});

