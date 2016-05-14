/**
 * Route module
 *
 * @date 05/04/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var route = {};

module.exports = route;

route.authStates = function($stateProvider, ngAdminRestifyProvider) {
    var options = ngAdminRestifyProvider.options;
    if (options.auth) {
        $stateProvider.state('login', {
            url: '/login',
            template: '<login-page></login-page>',
            controller: 'LoginSignupCtrl',
            public: true
        });
        $stateProvider.state('register', {
            url: '/register',
            template: '<register-page></register-page>',
            controller: 'LoginSignupCtrl',
            public: true
        });
    }
};
