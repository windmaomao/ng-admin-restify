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
	// var directive = require('./directive');

	angular.module('ng-admin-restify', ['ng-admin'])
	    // .directive('dashboardPage', directive.dashboardDirective)
	    .provider('ngAdminRestify', provider.ngAdminRestifyProvider)
	    .config(provider.restangularProvider)
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
	        var filter = ngAdmin.options.rest.filter || 'flat';
	        var page = ngAdmin.options.rest.page || { page: 'p', limit: 'pageSize' };
	        var sort = ngAdmin.options.rest.sort || { field: 'sort', plus: true };

	        // List view
	        if (operation == 'getList') {
	            if ("_filters" in params) {
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
	    admin = nga.application(options.site).baseApiUrl(options.url);
	    // add tabs for each model
	    ngAdmin.setupEntities(options.entities);
	    // add menu for each model
	    if (options.routes) {
	        ngAdmin.setupMenus(options.routes);
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
	                        .template(field.template)
	                    ;
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
	                case 'reference':
	                    nf = nga.field(field.field, field.type)
	                        .targetEntity(entities[field.targetEntity])
	                        .targetField(nga.field(field.targetField))
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
	                case 'date':
	                case 'datetime':
	                case 'string':
	                default:
	                    nf = nga.field(field.field);
	                    break;
	            };
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
	        var id = op.id || 'id';
	        var entity = nga.entity(entityName).identifier(nga.field(id));
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

	        var entityName = op.entity || key;
	        var id = op.id || 'id';
	        var fields = op.fields;
	        var defaultFields = op.default.fields;
	        var listFields = op.list.fields || defaultFields;
	        var showFields = op.show.fields || defaultFields;
	        var creationFields = op.creation.fields || defaultFields;
	        var searchFields = op.search.fields || id;

	        var entity = entities[entityName];

	        var listView = entity.listView()
	            .fields(ngAdmin.ngaFieldsFromModel(entityName, listFields))
	            .listActions(['show', 'edit'])
	            // .filters(ngAdmin.assembleSearchFields(nga, searchFields))
	            .filters(ngAdmin.ngaFieldsFromModel(entityName, searchFields))
	        ;
	        if (op.list.sort) {
	            var sort = op.list.sort || '';
	            listView.sortField(sort.field).sortDir(sort.dir);
	        }
	        if (op.list.title) {
	            listView.title(op.list.title);
	        }

	        entity.creationView()
	            .fields(ngAdmin.ngaFieldsFromModel(entityName, creationFields, true))
	        ;

	        entity.editionView()
	            .fields(ngAdmin.ngaFieldsFromModel(entityName, creationFields, true))
	            .title('Edit')
	            .onSubmitSuccess(function(progression, notification, $state, entry, entity) {
	                console.log(entry);
	                // stop the progress bar
	                progression.done();
	                // add a notification
	                notification.log(entity.name() + " has been successfully edited.", { addnCls: 'humane-flatty-success' });
	                // redirect to the list view
	                $state.go($state.get('list'), { entity: entity.name() });
	                // cancel the default action (redirect to the edition view)
	                return false;
	            })
	        ;

	        var showView = entity.showView()
	            .fields(ngAdmin.ngaFieldsFromModel(entityName, showFields))
	        ;

	        if (op.show.title) {
	            showView.title(capitalize(entityName) + ': {{ entry.values.' + op.show.title + ' }}');
	        }
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
	    url: '/v1/',
	    rest: {
	        url: '/v1/',
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


/***/ }
/******/ ]);