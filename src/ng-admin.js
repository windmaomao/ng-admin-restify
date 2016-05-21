/**
 * NG Admin module
 *
 * Handles setup of ng admin
 *
 * @date 03/29/16
 * @author Fang Jin <fang-a.jin@db.com>
*/

var capitalize = require("underscore.string/capitalize");

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
    // add dashboard collection
    if (options.dashboard) {
        ngAdmin.setupDashboard(options.dashboard);
    }
    // create custom header
    if (options.auth) {
        admin.header('<header-partial></header-partial>');
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
    var dashboard = nga.dashboard()
        .template('<dashboard-page></dashboard-page>');
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
