var app = angular.module("gififyApp", []);

//app.controller("gififyCtrl", function ($scope) {
//    $scope.loadMoreTweets = function () {
//        alert("LOAD gifs");
//    }
//})


app.directive("gifify", function(){
    return {
        restrict: "E",
        template: "<span ng-repeat='letter in letters'>{{letter}}</span>",


        link: function (scope, element, attrs) {
            var letters = attrs.letters,
                seperatedLetters = [];
            //scope.seperatedLetters = attrs.letters.split('');

            for (var i = 0; i < letters.length; i++) {
                console.log(letters.charAt(i));
                seperatedLetters[i] = letters.charAt(i);
            }

            scope.letters = seperatedLetters;


            console.log(scope.letters);
        }
    };
});