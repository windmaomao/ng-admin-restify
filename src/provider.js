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
        // create custom dashboard
        app.dashboard().template('<dashboard-page></dashboard-page>');
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
        return {};
    };
};

provider.restangularProvider = function(RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
        // console.log(params);
        var entity = ngAdmin.options.entities[what];
        // List view
        if (operation == 'getList') {
            // search field
            var searchField = '_id';
            if (entity.search.fields.length) {
                searchField = entity.search.fields[0];
            }
            if (("_filters" in params) && (searchField in params._filters)) {
                params.q = {};
                params.q[searchField] = { $regex: params._filters[searchField] }
            }
            // params.q = { NAME: { $regex: params._filters.NAME } };
            delete params._filters;

            // pagination
            params.pageSize = params._perPage;
            delete params._perPage;
            params.p = params._page - 1;
            delete params._page;

            // sort
            params.sort = params._sortField;
            if (params._sortDir !== 'ASC') {
                params.sort = '-' + params.sort;
            }
            delete params._sortField;
            delete params._sortDir;
        }
        return { params: params };
    });
};

module.exports = provider;
