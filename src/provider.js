/**
 * Provider module
 *
 * @date 04/01/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var ngAdmin = require('./ng-admin');
var defaultOptions = require('./config');

var provider = {};

provider.ngAdminRestifyProvider = function(NgAdminConfigurationProvider) {
    this.options = defaultOptions;

    // Given ng-admin provider and options
    // Return an application instance
    var initNGAdmin = function(nga, options) {
        // create an admin application
        var app = ngAdmin.create(nga, options);
        // app.dashboard(nga.dashboard().template('<dashboard-page></dashboard-page>'));
        // create custom header
        if (options.auth) {
            app.header('<header-partial></header-partial>');
        }
        // attach the admin application to the DOM and run it
        ngAdmin.attach(app);

        return app;
    };

    /**
     * Configure ngAdminRestify Provider
     */
    this.configure = function(options) {
        if (options) {
            this.options = options;
        }

        //Basic ngAdminConfigurationProvider setup
        // var nga = NgAdminConfigurationProvider;
        // var admin = nga.application(this.options.site)
        //     .baseApiUrl(this.options.url);
        // nga.configure(admin);

        return initNGAdmin(NgAdminConfigurationProvider, this.options);
    };

    this.$get = function() {
        var self = this;
        return {
            options: self.options
        };
    };
};

provider.restangularProvider = function(RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
        // console.log(params);
        var entity = ngAdmin.options.entities[what];
        var filter = ngAdmin.options.rest.filter || 'flat';
        var page = ngAdmin.options.rest.page || { page: 'p', limit: 'pageSize' };
        var sort = ngAdmin.options.rest.sort || { field: 'sort', plus: true };

        // List view
        if (operation == 'getList') {
            if ("_filters" in params) {
                // console.log(what, params._filters);
                // console.log(entity.search);
                angular.forEach(entity.search.fields, function(searchField) {
                    // search field
                    // var searchField = '_id';
                    // if (entity.search.fields.length) {
                    //     searchField = entity.search.fields[0];
                    // }
                    if (searchField in params._filters) {
                        // params.filter = {};
                        // params.q[searchField] = { $regex: params._filters[searchField] }
                        switch (filter) {
                            case 'flat':
                                params[searchField] = params._filters[searchField];
                                break;
                            case 'q':
                            case 'filter':
                                params[filter] = {};
                                params[filter][searchField] = params._filters[searchField];
                                break;
                            default:
                                break;
                        }
                    }
                });
                delete params._filters;
            }

            // pagination, use page or start/end
            if (page.page) {
                if (params._perPage) {
                    params[page.limit] = params._perPage;
                    delete params._perPage;
                }
                if (params._page) {
                    params[page.page] = params._page - 1;
                    delete params._page;
                }
            } else {
                if (params._perPage) {
                    params[page.start] = (params._page - 1) * params._perPage;
                    params[page.end] = params[page.start] + params._perPage;
                    delete params._perPage;
                    delete params._page;
                }
            }

            // sort
            if (sort.plus) {
                if (params._sortField) {
                    params[sort.field] = params._sortField;
                    if (params._sortDir !== 'ASC') {
                        params.sort = '-' + params.sort;
                    }
                    delete params._sortField;
                    delete params._sortDir;
                }
            } else {
                if (params._sortField) {
                    params[sort.field] = params._sortField;
                    delete params._sortField;
                }
                if (params._sortDir) {
                    params[sort.order] = params._sortDir;
                    delete params._sortDir;
                }
            }
            // add no cache flag for IE
            params['no_cache'] = Date.now();
        }
        return { params: params };
    });
};

module.exports = provider;
