/**
 * Directive module
 *
 * @date 04/01/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var dashboardDirectiveTemplate = require('./view/dashboard.html');

var directive = {};

directive.dashboardDirective = function() {
    return {
        restrict: 'AE',
        template: dashboardDirectiveTemplate,
        replace: false,
    };
};

module.exports = directive;
