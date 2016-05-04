/**
 * Directive module
 *
 * @date 04/01/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var config = require('./config');
var directive = {};

module.exports = directive;

// directive.dashboardDirective = function() {
//     return {
//         restrict: 'AE',
//         template: require('./view/dashboard.html'),
//         replace: false,
//     };
// };

directive.loginDirective = function() {
    return {
        restrict: 'AE',
        template: require('./view/login.html'),
        replace: false,
    };
};

directive.registerDirective = function() {
    return {
        restrict: 'AE',
        template: require('./view/register.html'),
        replace: false,
    };
};

directive.headerDirective = function($http, $state) {
    return {
        restrict: 'AE',
        template: require('./view/header.html'),
        replace: false,
        link: function(scope, element, attrs) {
            var prefix = config.rest.url;
            scope.logout = function() {
                $http.get(prefix + '/logout').then(function(result) {
                    $state.go('login');
                });
            }
        }
    };
};
