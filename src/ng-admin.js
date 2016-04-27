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
        var listActions = op.list.actions || ['show', 'edit'];

        var entity = entities[entityName];

        var listView = entity.listView()
            .fields(ngAdmin.ngaFieldsFromModel(entityName, listFields))
            .listActions(listActions)
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
