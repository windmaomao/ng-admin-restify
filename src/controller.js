/**
 * Controller module
 *
 * @date 05/04/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var controller = {};
var config = require('./config');

module.exports = controller;

controller.loginSignupCtrl = function($scope, $http, $state) {
    $scope.user = {};
    $scope.error = "";
    var prefix = config.rest.url;
    $scope.login = function() {
        $http.post(prefix + '/login', $scope.user).then(function(result) {
            $state.go('dashboard');
        }, function(error) {
            $scope.error = error.statusText;
        });
    };
    $scope.signup = function() {
        $http.post(prefix + '/register', $scope.user).then(function(result) {
            $state.go('dashboard');
        }, function(error) {
            $scope.error = error.statusText;
        });
    };
}
