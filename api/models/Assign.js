/**
 * Service.js
 */
const moment = require('moment');
const api = require('./Api.js');

module.exports = {
    attributes: {
        userId: {
            type: 'string',
            required: true
        },
        user: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                create: true,
                view: true,
                update: true,
                delete: true
            }
        },

        category: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                create: true,
                view: true,
                update: true,
                delete: true
            }
        },

        service: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                create: true,
                view: true,
                update: true,
                delete: true
            }
        },

        product: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                create: true,
                view: true,
                update: true,
                delete: true
            }
        },

        order: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                view: true,
                delete: false,
                create: false,
                update: true
            }
        },

        booking: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                view: true,
                delete: false,
                create: false,
                update: true
            }
        },
        transaction: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: false,
                create: false,
                view: true,
                update: true
            }
        },

        file: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: true,
                create: false,
                view: true,
                update: true
            }
        },

        promo: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: true,
                create: true,
                view: true,
                update: true
            }
        },

        rating: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: true,
                create: true,
                update: true,
                view: false
            }
        },

        cms: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: true,
                create: true,
                view: true,
                update: true
            }
        },

        helpdesk: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                update: true,
                delete: false,
                create: false,
                view: false
            }
        },
        banner: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: false,
                create: false,
                update: false,
                view: false
            }
        },

        setting: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: false,
                create: false,
                update: false,
                view: false
            }
        },
        godView: {
            type: 'json',
            columnType: 'object',
            defaultsTo: {
                list: true,
                delete: false,
                create: false,
                update: false,
                view: false
            }
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req, displayCategory = false) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['userId'] = api.checkAttribute(req.userId);

        json['user'] = api.checkAttribute(req.user);

        json['service'] = api.checkAttribute(req.service);

        json['category'] = api.checkAttribute(req.category);

        json['product'] = api.checkAttribute(req.product);

        json['order'] = api.checkAttribute(req.order);

        json['transaction'] = api.checkAttribute(req.transaction);

        json['booking'] = api.checkAttribute(req.booking);

        json['promo'] = api.checkAttribute(req.promo);

        json['rating'] = api.checkAttribute(req.rating);

        json['cms'] = api.checkAttribute(req.cms);

        json['helpdesk'] = api.checkAttribute(req.helpdesk);

        json['banner'] = api.checkAttribute(req.banner);

        json['setting'] = api.checkAttribute(req.setting);

        json['godView'] = api.checkAttribute(req.godView);

        json['file'] = api.checkAttribute(req.file);

        return json;
    }
};
