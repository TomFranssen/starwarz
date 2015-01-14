var app = angular.module("gififyApp", []);


app.controller("AppCtrl", function ($scope) {
    $scope.loadMoreTweets = function () {
        alert("Loading tweets!");
    }
})

app.directive('gifify', ['$http', function($http){
    return {
        restrict: 'E',
        template: '<div class="gifify-container"><span ng-repeat="letter in letters track by $index" style="background-image: url({{letter.background}})" class="gifify-letter">{{letter.character}}</span></div>',
        scope: {},
        link: function (scope, element, attrs) {
            var query = attrs.query,
                seperatedLetters = [],
                letterIndex,
                gifIndex,
                gifs = [];

            $http.get('http://api.giphy.com/v1/gifs/search?q=' + query + '&api_key=dc6zaTOxFJmzC')
                .success(function(data, status, headers, config) {
                    for (gifIndex = 0; gifIndex < data.data.length; gifIndex++) {
                        gifs.push(data.data[gifIndex].images.fixed_height.url)
                    }
                    console.log(gifs);
                    for (letterIndex = 0; letterIndex < query.length; letterIndex++) {
                        seperatedLetters.push({
                            character: query.charAt(letterIndex),
                            background: gifs[letterIndex]
                        });
                    }

                    scope.query = attrs.query;
                    scope.letters = seperatedLetters;
                })
                .error(function(data, status, headers, config) {
                    // console.log('error');
                });

        }
    };
}]);