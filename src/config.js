/**
 * NG Admin config module
 *
 * Use a script to define the setting for ng-admin
 *
 * @date 03/29/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

module.exports = {
    site: 'ngAdmin Restify',
    auth: false,
    url: '/v1/',
    rest: {
        url: '/v1',
        filter: '',
        page: {
            start: '_start',
            end: '_end',
            limit: '_limit',
            page: false,
        },
        sort: {
            field: '_sort',
            order: '_order',
            plus: false
        }
    },
    entities: {},
};
