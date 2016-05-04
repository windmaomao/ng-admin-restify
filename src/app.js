/**
 * NG Admin Restify Module for angularJS
 *
 * @date 04/11/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var config = require('./config');
var provider = require('./provider');
var route = require('./route');
var directive = require('./directive');
var controller = require('./controller');
var run = require('./run');

var app = angular.module('ng-admin-restify', ['ng-admin'])
    // .directive('dashboardPage', directive.dashboardDirective)
    .provider('ngAdminRestify', provider.ngAdminRestifyProvider)
    .config(provider.restangularProvider)
;

if (config.auth) {
    app.config(route.authStates)
        .run(run.stateChangeStart)
        .directive('loginPage', directive.loginDirective)
        .directive('registerPage', directive.registerDirective)
        .directive('headerPartial', directive.headerDirective)
        .controller('LoginSignupCtrl', controller.loginSignupCtrl)
    ;
}
