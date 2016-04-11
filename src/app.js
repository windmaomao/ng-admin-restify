/**
 * NG Admin Restify Module for angularJS
 *
 * @date 04/11/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var provider = require('./provider');
// var directive = require('./directive');

angular.module('ng-admin-restify', ['ng-admin'])
    // .directive('dashboardPage', directive.dashboardDirective)
    .provider('ngAdminRestify', provider.ngAdminRestifyProvider)
    .config(provider.restangularProvider)
;
