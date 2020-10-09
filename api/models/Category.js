/**
 * Category.js
 */
const _ = require('lodash');
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true,
        },
        image: {
            type: 'string',
            allowNull: true,
        },
        description: {
            type: 'string',
            allowNull: true,
        },
        slug: {
            type: 'string',
        },
        status: {
            type: 'number',
            defaultsTo: 1,
        },
        type_id: {
            type: 'number',
            defaultsTo: 1,
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2,
        },
        created_at: {
            type: 'number',
        },
        updated_at: {
            type: 'number',
            allowNull: true,
        },
        created_by: {
            type: 'string',
            allowNull: true,
        },
        deleted_at: {
            type: 'number',
            allowNull: true,
        },
        deleted_by: {
            type: 'string',
            allowNull: true,
        },
    },

    beforeCreate: async function (valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getSlug: async function (string, repeat = '') {
        var slug = '';
        var text = string;
        if (repeat != '') {
            text = string + ' ' + repeat.substr(repeat.length - 3);
        }
        if (typeof text !== 'undefined') {
            slug = text
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }
        const category = await Category.find({
            slug: slug,
        }).limit(1);
        if (category && category.length > 0) {
            await this.getSlug(string, category[0].created_at + '');
        }
        return slug;
    },

    getJson: async function (req, more = false) {
        var json = {};
        var serviceModel = [];

        json['key'] = api.checkAttribute(req.id);
        json['heading'] = api.checkAttribute(req.name);
        json['description'] = api.checkAttribute(req.description);
        var tagline = await Service.getTagline(req.id);
        if (tagline) {
            json['tagline'] = tagline;
        } else {
            json['tagline'] = sails.__('No service available');
        }
        json['status'] = req.status;
        if (req.image) {
            json['image'] = Api.getActualImages(
                '/uploads/category/',
                req.image
            );
        } else {
            json['image'] = Api.getBaseImages();
        }
        if (more == true) {
            // var checkArray = [];
            // var users = await User.find({
            //     role: sails.config.constants.ROLE_ADMIN
            // });
            // if (users && users.length > 0) {
            //     for (x in users) {
            //         checkArray.push(users[x].id);
            //     }
            // }
            var services = await Service.find({
                category_id: req.id,
                status: sails.config.constants.STATUS_ACTIVE,
                deleted_at: null,
                // created_by: checkArray
            });
            if (services && services.length > 0) {
                for (x in services) {
                    serviceModel.push(await Service.getJson(services[x]));
                }
                json['services'] = serviceModel;
            } else {
                json['services'] = [];
            }
        }
        json['created_at'] = req.created_at;
        json['deleted_at'] = req.deleted_at;
        json['deleted_by'] = req.deleted_by;
        json['status'] = req.status;
        return json;
    },

    getAll: async function (categories, services = false) {
        var categoryModel = [];
        for (const category of categories) {
            const data = await this.getJson(category, services);
            if (services == true) {
                if (data.services.length > 0) {
                    categoryModel.push(data);
                }
            } else {
                categoryModel.push(data);
            }
        }
        return categoryModel;
    },

    getAdminAll: async function (categories, services = false) {
        var categoryModel = [];
        for (const category of categories) {
            const data = await this.getJson(category, services);
            if (data) {
                categoryModel.push(data);
            }
        }
        return categoryModel;
    },

    getMyJson: async function (id, serviceIds, include, myId = null) {
        var json = {};
        var serviceModel = [];

        var req = await Category.find({
            id: id,
            status: sails.config.constants.STATUS_ACTIVE,
            deleted_at: null,
        }).limit(1);
        if (req && req.length > 0) {
            json['key'] = api.checkAttribute(req[0].id);
            json['heading'] = api.checkAttribute(req[0].name);
            json['description'] =
                req[0].description != null
                    ? api.checkAttribute(req[0].description)
                    : '';
            var tagline = await Service.getTagline(req[0].id);
            if (tagline) {
                json['tagline'] = tagline;
            } else {
                json['tagline'] = sails.__('No service available');
            }
            if (req[0].image) {
                json['image'] = Api.getActualImages(
                    '/uploads/category/',
                    req[0].image
                );
            } else {
                json['image'] = Api.getBaseImages();
            }
            var checkArray = [];
            var users = await User.find({
                role: sails.config.constants.ROLE_ADMIN,
            });
            if (users && users.length > 0) {
                for (x in users) {
                    checkArray.push(users[x].id);
                }
            }
            if (myId) {
                checkArray.push(myId);
            }
            var services = [];
            if (include == 'true') {
                services = await Service.find({
                    id: serviceIds,
                    created_by: checkArray,
                    status: sails.config.constants.STATUS_ACTIVE,
                    deleted_at: null,
                });
            } else {
                services = await Service.find({
                    id: { '!=': serviceIds },
                    category_id: id,
                    created_by: checkArray,
                    status: sails.config.constants.STATUS_ACTIVE,
                    deleted_at: null,
                });
            }
            if (typeof services !== 'undefined') {
                for (x in services) {
                    serviceModel.push(
                        await Service.getJson(services[x], false)
                    );
                }
                json['services'] = serviceModel;
            }
        }
        return json;
    },

    getServices: async function (id) {
        var users = await User.find({
            where: { role: sails.config.constants.ROLE_ADMIN },
            select: ['id'],
        });
        var admins = [];
        if (users && users.length > 0) {
            for (x in users) {
                admins.push(users[x].id);
            }
        }

        var myOwn = await ProviderService.find({
            where: {
                created_by: id,
                status: sails.config.constants.STATUS_ACTIVE,
                is_deleted: sails.config.constants.IS_ACTIVE,
            },
            select: ['category_id', 'service_id'],
        }).sort('created_at DESC');
        var selfCreatedService = [];
        if (myOwn && myOwn.length > 0) {
            for (x in myOwn) {
                selfCreatedService.push(myOwn[x].service_id);
            }
        }
        selfCreatedService = _.uniqBy(selfCreatedService, function (e) {
            return e;
        });
        var categoryModel = [];
        var existing = await Category.find({
            created_by: admins,
            status: sails.config.constants.STATUS_ACTIVE,
            is_deleted: sails.config.constants.IS_ACTIVE,
        });
        if (existing.length > 0) {
            for (x in existing) {
                var data = await this.getMyJson(
                    existing[x].id,
                    selfCreatedService,
                    'false',
                    id
                );
                categoryModel.push(data);
            }
        }
        return categoryModel;
    },

    getCategoryImage: async function (id) {
        if (typeof id == 'undefined' && id == null) {
            return Api.getBaseImages();
        }
        var category = Category.find({
            id: id,
        }).limit(1);
        if (category && category.length > 0) {
            if (category[0].image) {
                return Api.getActualImages(
                    '/uploads/category/',
                    category[0].image
                );
            }
        }
        return Api.getBaseImages();
    },

    getFoodJson: async function (req, services) {
        let json = {};
        json['key'] = api.checkAttribute(req.id);
        json['heading'] = api.checkAttribute(req.name);
        json['description'] = api.checkAttribute(req.description);
        json['status'] = req.status;
        if (req.image) {
            json['image'] = Api.getActualImages(
                '/uploads/category/',
                req.image
            );
        } else {
            json['image'] = Api.getBaseImages();
        }
        json['created_at'] = req.created_at;
        json['deleted_at'] = req.deleted_at;
        json['deleted_by'] = req.deleted_by;
        json['status'] = req.status;
        json['services'] = services;
        return json;
    },
};
