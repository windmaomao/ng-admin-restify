/**
 * Run module
 *
 * @date 05/04/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var config = require('./config');
var run = {};

module.exports = run;

run.stateChangeStart = function($rootScope, $state, $http) {
    var prefix = config.rest.url;
    $rootScope.$on('$stateChangeStart', function(event, next, params) {
        // console.log(next);
        if (!next.public) {
            $http.get(prefix + '/status').then(function(result) {
                // console.log(result);
                if (!result.data) {
                    event.preventDefault();
                    $state.go('login');
                }
            }, function(err) {
                event.preventDefault();
                $state.go('login');
            })
        }
    });
}
