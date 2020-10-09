/**
 * Service.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true,
        },
        category_id: {
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
        icon: {
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
        created_at: {
            type: 'number',
        },
        updated_at: {
            type: 'number',
        },
        deleted_at: {
            type: 'number',
            allowNull: true,
        },
        deleted_by: {
            type: 'string',
            allowNull: true,
        },
        created_by: {
            type: 'string',
            allowNull: true,
        },
    },

    schema: true,

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
        const service = await Service.find({
            slug: slug,
        }).limit(1);
        if (service && service.length > 0) {
            await this.getSlug(string, service[0].created_at + '');
        }
        return slug;
    },

    getTagline: async function (id) {
        var serviceModel = [];
        var services = await Service.find({
            where: {
                category_id: id,
                status: sails.config.constants.STATUS_ACTIVE,
                deleted_at: null,
            },
        }).limit(4);

        if (services.length > 0) {
            for (let x in services) {
                let temp = services[x].name;
                if (temp && temp.length > 0) {
                    serviceModel.push(services[x].name);
                }
            }
        }
        return serviceModel.join(', ');
    },
    getName: async function (id) {
        var service = await Service.find({
            id: id,
            status: sails.config.constants.STATUS_ACTIVE,
            deleted_by: null,
        });

        if (service.length > 0) {
            if (typeof service[0].name !== 'undefined') {
                return service[0].name;
            }
        }
    },

    getJson: async function (req, displayCategory = false) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['heading'] = api.checkAttribute(req.name);
        json['slug'] = api.checkAttribute(req.slug);
        json['description'] = api.checkAttribute(req.description);
        json['status'] = api.checkAttribute(req.status);
        const category = await Category.find({
            id: req.category_id,
        }).limit(1);
        json['categoryName'] = category[0].name;
        if (displayCategory) {
            if (category.length > 0) {
                json['category'] = await Category.getJson(category[0], false);
            } else {
                json['category'] = {};
            }
        }
        if (req.image) {
            json['image'] = Api.getActualImages('/uploads/service/', req.image);
        } else {
            json['image'] = Api.getBaseImages();
        }
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        return json;
    },

    getSmall: async function (req, displayCategory = false) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['heading'] = api.checkAttribute(req.name);
        const category = await Category.find({
            id: req.category_id,
        }).limit(1);
        json['categoryName'] = category[0].name;
        if (displayCategory) {
            if (category.length > 0) {
                json['category'] = await Category.getJson(category[0], false);
            } else {
                json['category'] = {};
            }
        }
        return json;
    },

    getAll: async function (services, displayService = false) {
        var serviceModel = [];
        for (x in services) {
            const data = await this.getJson(services[x], displayService);
            serviceModel.push(data);
        }
        return serviceModel;
    },
};
