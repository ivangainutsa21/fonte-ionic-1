var app = angular.module('starter', [])


.controller('ListCtrl', ['$http', '$scope', function($http, $scope) {
    var getLocal = function(v) {
      return $http.get('ajax/' + v + '.json').success(function(data) {
        $(".waiting").hide();
        console.log(v + " local API called with success", data);
        $scope.list = data;
      }).error(function(error) {
        console.log(v + " local API unable to be called");
      });
    }
    getLocal('ot_books');

}])

;