/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * NG Admin Restify Module for angularJS
	 *
	 * @date 04/11/16
	 * @author Fang Jin <fang-a.jin@db.com>
	*/

	var provider = __webpack_require__(1);
	var route = __webpack_require__(6);
	var directive = __webpack_require__(7);
	var controller = __webpack_require__(11);
	var run = __webpack_require__(12);

	var app = angular.module('ng-admin-restify', ['ng-admin'])
	    // .directive('dashboardPage', directive.dashboardDirective)
	    .provider('ngAdminRestify', provider.ngAdminRestifyProvider)
	    .config(provider.restangularProvider)
	;

	// auth
	app.config(route.authStates)
	    .run(run.stateChangeStart)
	    .directive('loginPage', directive.loginDirective)
	    .directive('registerPage', directive.registerDirective)
	    .directive('headerPartial', directive.headerDirective)
	    .controller('LoginSignupCtrl', controller.loginSignupCtrl)
	;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Provider module
	 *
	 * @date 04/01/16
	 * @author Fang Jin <fang-a.jin@db.com>
	*/

	var ngAdmin = __webpack_require__(2);
	var defaultOptions = __webpack_require__(5);

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * NG Admin module
	 *
	 * Handles setup of ng admin
	 *
	 * @date 03/29/16
	 * @author Fang Jin <fang-a.jin@db.com>
	*/

	var capitalize = __webpack_require__(3);

	var ngAdmin = {};

	var admin;
	var nga;
	var entities;
	var models;

	// Publish ngAdmin options
	ngAdmin.options = {};

	// Get admin handle
	ngAdmin.create = function(provider, options) {
	    // set nga AngularJS provider
	    ngAdmin.options = options;
	    nga = provider;
	    // create admin
	    admin = nga.application(options.site).baseApiUrl(options.url + '/');
	    // add tabs for each model
	    ngAdmin.setupEntities(options.entities);
	    // add menu for each model
	    if (options.routes) {
	        ngAdmin.setupMenus(options.routes);
	    }
	    if (options.dashboard) {
	        ngAdmin.setupDashboard(options.dashboard);
	    }
	    // return admin instance
	    return admin;
	};

	// Attach admin to angularJS
	ngAdmin.attach = function() {
	    nga.configure(admin);
	};

	// Assemble nga fields based on fields definiation array
	var assembleFields = function(fields, editing) {
	    var f = [];
	    _.each(fields, function(field) {
	        var nf = {};
	        if (!(field === Object(field))) {
	            nf = nga.field(field);
	        } else {
	            switch (field.type) {
	                case 'template':
	                    nf = nga.field(field.field, 'template')
	                        .template(field.template);
	                    break;
	                case 'boolean':
	                    nf = nga.field(field.field, field.type)
	                        .validation({required: true});
	                    break;
	                case 'float':
	                case 'json':
	                case 'text':
	                    nf = nga.field(field.field, field.type);
	                    break;
	                case 'number':
	                    nf = nga.field(field.field, field.type)
	                        .format(field.format)
	                    break;
	                case 'choice':
	                    nf = nga.field(field.field, field.type);
	                    if (field.choiceField) {
	                        nf.choices(function(entry) {
	                            return field.choices.filter(function(choice) {
	                                return choice[field.choiceField] == entry.values[field.choiceField];
	                            });
	                        });
	                    } else {
	                        nf.choices(field.choices);
	                    }
	                    break;
	                case 'string':
	                    if (!editing) {
	                        switch (field.format) {
	                            case 'url':
	                                var caption = field.caption || 'Link';
	                                nf = nga.field(field.field, 'template')
	                                    .template('<a href="{{ entry.values.url }}" target="_blank" ng-show="entry.values.url">' + caption + '</a>')
	                                ;
	                                break;
	                            case 'image':
	                                nf = nga.field(field.field, 'template')
	                                    .template('<img ng-src="' + field.url + '{{ entry.values.name }}"' + ' width="' + field.width + 'px" />')
	                                ;
	                                break;
	                            default:
	                                nf = nga.field(field.field);
	                        }
	                    } else {
	                        nf = nga.field(field.field);
	                    }
	                    break;
	                case 'integer':
	                    if (!editing) {
	                        switch (field.format) {
	                            case 'count':
	                                nf = nga.field(field.field, 'template')
	                                    .template('{{ entry.values.' + field.targetField + '.length }}')
	                                ;
	                                break;
	                            case 'rating':
	                                nf = nga.field(field.field, 'template')
	                                    .template('<star-rating stars="{{ entry.values.rating }}"></star-rating>');
	                                break;
	                            default:
	                                nf = nga.field(field.field);
	                        }
	                    } else {
	                        nf = nga.field(field.field);
	                    }
	                    break;
	                case 'date':
	                case 'datetime':
	                    var formatString = field.formatString || '';
	                    nf = nga.field(field.field, field.type)
	                        .format(formatString);
	                    break;
	                case 'reference':
	                    var tField = nga.field(field.targetField);
	                    if (field.targetFieldMap) {
	                        tField.map(field.targetFieldMap);
	                    }
	                    nf = nga.field(field.field, field.type)
	                        .targetEntity(entities[field.targetEntity])
	                        .targetField(tField)
	                        .detailLinkRoute('show')
	                    ;
	                    break;
	                case 'referenced_list':
	                    var tFields = [];
	                    if (field.targetFields) {
	                        tFields = ngAdmin.ngaFieldsFromModel(
	                            field.targetEntity, field.targetFields
	                        );
	                    }
	                    nf = nga.field(field.field, field.type)
	                        .targetEntity(entities[field.targetEntity])
	                        .targetReferenceField(field.targetReferenceField)
	                        .targetFields(tFields)
	                    ;
	                    break;
	                case 'reference_many':
	                    nf = nga.field(field.field, field.type)
	                        .targetEntity(entities[field.targetEntity])
	                        .targetField(nga.field(field.targetField))
	                        // .detailLinkRoute('show')
	                        .perPage(0)
	                    ;
	                    break;
	                case 'id':
	                // case 'string':
	                default:
	                    nf = nga.field(field.field);
	                    break;
	            };
	            // default value
	            if (field.defaultValue) {
	                nf.defaultValue(field.defaultValue);
	            }
	            // read-only
	            if (field.readOnly) {
	                nf.editable(false);
	            }
	            // add attributes
	            if (field.attributes) {
	                nf.attributes(field.attributes);
	            }
	            // add filters
	            if (field.permanentFilters) {
	                nf.permanentFilters(field.permanentFilters);
	            }
	            // add map
	            if (field.map) {
	                nf.map(field.map);
	            }
	            // add page
	            if (field.perPage) {
	                nf.perPage(field.perPage);
	            }
	            // add sort
	            if (field.sort) {
	                nf.sortField(field.sort.field);
	                nf.sortDir(field.sort.dir);
	            }
	            // add field label
	            if (field.label) {
	                nf.label(field.label);
	            }
	            // add detail link
	            if (field.detailRoute) {
	                nf.isDetailLink(true);
	                nf.detailLinkRoute(field.detailRoute);
	            }
	            // set field pinned
	            if (field.pinned) {
	                nf.pinned(true);
	            }
	        }
	        f.push(nf);
	    });
	    return f;
	};

	// assemble nga search fields
	ngAdmin.assembleSearchFields = function(p, fields) {
	    return [p.field(fields[0]).label(fields[0]).pinned(true)];
	};

	// convert model and merge with nga fields
	var fieldsFromModel = function(model) {
	    var fields = _.keys(model);
	    var updated = {};

	    _.each(fields, function(field) {
	        var updatedField = {};
	        var modelField = {};
	        if (!(field === Object(field))) {
	            updatedField.field = field;
	            if (!(model[field] === Object(model[field]))) {
	                modelField = { type: model[field] };
	            } else {
	                modelField = model[field];
	            }
	            updatedField = _.defaults(updatedField, modelField);
	        } else {
	            updatedField = field;
	        }
	        updated[updatedField.field] = updatedField;
	    });

	    return updated;
	};

	// Assemble NGA model fields with model and fields name
	ngAdmin.ngaFieldsFromModel = function(model, fields, editing) {
	    // var modelFields = this.entityModelFields(model, fields);
	    // return this.assembleFields(modelFields);

	    var nlist = [];
	    _.each(fields, function(field) {
	        nlist.push(models[model][field]);
	    });
	    // console.log(model, nlist);
	    return assembleFields(nlist, editing);
	};

	// Deep defaults
	var defaults2nd = function(target, source) {
	    for (var prop in source) {
	        if (prop in target) {
	            _.extend(target[prop], source[prop]);
	        }
	    }
	    return target;
	};

	var handleCommonView = function(view, entityName, fields, options) {
	    // console.log(view);
	    // setup fields
	    var edition = (view._type == 'EditionView');
	    var ff = ngAdmin.ngaFieldsFromModel(entityName, fields, edition);
	    view.fields(ff);

	    // setup view properties
	    switch (view._type) {
	        default:
	        case 'ListView':
	            var actions = options.actions || ['show', 'edit'];
	            var filters = options.filters || 'id';
	            view.title(capitalize(entityName))
	                .listActions(actions)
	                .filters(ngAdmin.ngaFieldsFromModel(entityName, filters));
	            ;
	            break;
	        case 'EditView':
	            view.title('Edit ' + entityName);
	            break;
	        case 'CreateView':
	            view.title('Create a ' + entityName);
	            break;
	        case 'ShowView':
	            view.title(capitalize(entityName) + ' details');
	            break;
	    }

	    if (options.sort) {
	        var sort = options.sort || '';
	        view.sortField(sort.field).sortDir(sort.dir);
	    }
	    if (options.perPage) {
	        view.perPage(options.perPage);
	    }
	    if (options.title) {
	        view.title(options.title);
	    }
	    if (options.description) {
	        view.description(options.description);
	    }
	    if (!options.gotoShow && view.onSubmitSuccess) {
	        view.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
	            progression.done();
	            notification.log(capitalize(entity.name()) + ' is successfully updated.', { addnCls: 'humane-flatty-success' });
	            $state.go($state.get('list'), { entity: entity.name() });
	            return false;
	        }]);
	    }

	    return view;
	};

	// Setup view
	ngAdmin.setupView = function(entity, viewName, options) {
	    var op = options[viewName];
	    var defaultFields = options.default.fields;
	    var fields = op.fields || defaultFields;
	    var entityName = entity._name;

	    // create view, ex. entity.creationView();
	    var view = entity[viewName + 'View']();
	    // setup common view properties
	    handleCommonView(view, entityName, fields, op);
	    return view;
	}

	// Setup entities for admin
	ngAdmin.setupEntities = function(opts) {
	    // populate model definition and ui entity
	    models = {};
	    entities = {};
	    _.each(opts, function(op, key) {
	        var entityName = op.entity || key;
	        // get model fields
	        models[entityName] = fieldsFromModel(op.model);
	        defaults2nd(models[entityName], op.fields);

	        // create entity
	        var entity = nga.entity(entityName);

	        if (op.id) {
	            entity.identifier(nga.field(op.id));
	        }
	        if (op.label) {
	            entity.label(op.label);
	        }
	        if (op.readOnly) {
	            entity.readOnly();
	        }
	        entities[entityName] = entity;
	        admin.addEntity(entity);
	    });

	    // populate entity view and fields
	    _.each(opts, function(op, key) {
	        // skip inactive entity
	        var disable = op.disable || false;
	        if (disable) {
	            return;
	        }

	        // create all entity views
	        var entityName = op.entity || key;
	        var entity = entities[entityName];
	        ['list', 'creation', 'edition', 'show'].map(function(item) {
	            ngAdmin.setupView(entity, item, op);
	        });
	    });
	};

	// Setup menus for admin
	ngAdmin.setupMenus = function(routes) {
	    var root = nga.menu();
	    _.each(routes, function(route) {
	        var main = nga.menu();
	        main.title(route.title);
	        if (route.icon) {
	            main.icon('<span class="glyphicon glyphicon-' + route.icon + '"></span> ');
	        }

	        _.each(route.items, function(item) {
	            var menu;
	            if (!_.isArray(item)) {
	                menu = nga.menu(entities[item]);
	            } else {
	                console.log(item);
	                menu = nga.menu(entities[item.entity])
	                    title('ABC');
	            }
	            main.addChild(menu);
	        });

	        root.addChild(main);
	    });
	    admin.menu(root);
	};

	// Setup dashboard
	ngAdmin.setupDashboard = function(collections) {
	    var dashboard = nga.dashboard();
	    if (collections) {
	        _.each(collections, function(col) {
	            var entityName = col.entity;
	            var entity = entities[entityName];
	            var collection = nga.collection(entity).name(col.name);
	            handleCommonView(collection, entityName, col.fields, col);
	            dashboard.addCollection(collection);
	        });
	    }
	    admin.dashboard(dashboard);
	};

	module.exports = ngAdmin;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var makeString = __webpack_require__(4);

	module.exports = function capitalize(str, lowercaseRest) {
	  str = makeString(str);
	  var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

	  return str.charAt(0).toUpperCase() + remainingChars;
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Ensure some object is a coerced to a string
	 **/
	module.exports = function makeString(object) {
	  if (object == null) return '';
	  return '' + object;
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

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
	    auth: true,
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


/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Directive module
	 *
	 * @date 04/01/16
	 * @author Fang Jin <fang-a.jin@db.com>
	*/

	var config = __webpack_require__(5);
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
	        template: __webpack_require__(8),
	        replace: false,
	    };
	};

	directive.registerDirective = function() {
	    return {
	        restrict: 'AE',
	        template: __webpack_require__(9),
	        replace: false,
	    };
	};

	directive.headerDirective = function($http, $state) {
	    return {
	        restrict: 'AE',
	        template: __webpack_require__(10),
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


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "<div class=\"container\" style=\"width: 450px; margin-top: 150px;\">\r\n\r\n    <h1>Welcome to Portal</h1>\r\n\r\n    <form class=\"form-signin\" ng-submit=\"login()\">\r\n        <h3 class=\"form-signin-heading\">Please sign in</h3>\r\n\r\n        <div class=\"alert alert-danger\" ng-if=\"error\">\r\n          <strong>{{ error }}</strong>\r\n        </div>\r\n\r\n        <input type=\"text\" ng-model=\"user.username\" class=\"form-control\" placeholder=\"Username\" required autofocus>\r\n        <input type=\"password\" ng-model=\"user.password\" class=\"form-control\" placeholder=\"Password\" style=\"margin-top: 2px;\">\r\n\r\n        <div class=\"checkbox\">\r\n            <label>\r\n                <input type=\"checkbox\" value=\"remember-me\"> Remember me\r\n            </label>\r\n        </div>\r\n\r\n        <button class=\"btn btn-lg btn-success btn-block\" type=\"submit\">Sign in</button>\r\n    </form>\r\n    <p style=\"margin-top:10px;\">If you don't have a account yet, please <a ui-sref=\"register\">Register</a>.</p>\r\n\r\n</div>\r\n"

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = "<div class=\"container\" style=\"width: 450px; margin-top: 150px;\">\r\n\r\n    <h1>Portal Registration</h1>\r\n\r\n    <form class=\"\" ng-submit=\"signup()\">\r\n        <div class=\"alert alert-danger\" ng-if=\"error\">\r\n          <strong>{{ error }}</strong>\r\n        </div>\r\n\r\n        <input type=\"text\" ng-model=\"user.username\" class=\"form-control\" placeholder=\"Username\" required autofocus>\r\n        <input type=\"password\" ng-model=\"user.password\" class=\"form-control\" placeholder=\"Password\" style=\"margin-top: 2px;\">\r\n        <input type=\"password\" ng-model=\"user.passwordConfirm\" class=\"form-control\" placeholder=\"Confirm Password\" style=\"margin-top: 2px;\">\r\n\r\n        <button class=\"btn btn-lg btn-success btn-block\" type=\"submit\">Sign Up</button>\r\n    </form>\r\n    <p style=\"margin-top:10px;\">If you have a account, please <a ui-sref=\"login\">Login</a>.</p>\r\n\r\n</div>\r\n"

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "<div class=\"navbar-header\">\r\n    <a class=\"navbar-brand\" href=\"#\" ng-click=\"appController.displayHome()\">\r\n        Portal\r\n    </a>\r\n</div>\r\n<p class=\"navbar-text navbar-right\">\r\n    <a ng-click=\"logout()\">\r\n        <span class=\"glyphicon glyphicon-lock\"></span>&nbsp;Logout\r\n    </a>\r\n</p>\r\n"

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Controller module
	 *
	 * @date 05/04/16
	 * @author Fang Jin <fang-a.jin@db.com>
	*/

	var controller = {};
	var config = __webpack_require__(5);

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


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * Run module
	 *
	 * @date 05/04/16
	 * @author Fang Jin <fang-a.jin@db.com>
	*/

	var run = {};

	module.exports = run;

	run.stateChangeStart = function($rootScope, $state, $http, ngAdminRestify) {
	    var options = ngAdminRestify.options;

	    if (options.auth) {
	        var prefix = options.rest.url;
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
	}


/***/ }
/******/ ]);