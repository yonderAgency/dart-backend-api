/**
 * AdminSettings.js
 */

const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        main_color: {
            type: 'string',
            defaultsTo: 'pink'
        },
        navbar_type: {
            type: 'number',
            defaultsTo: 1
        },
        is_dark: {
            type: 'boolean',
            defaultsTo: false
        },
        created_by: {
            type: 'string',
            required: true
        },
        updated_by: {
            type: 'string',
            required: true
        },
        created_at: {
            type: 'number'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req) {
        var json = {};

        json['main_color'] = api.checkAttribute(req.main_color);
        json['navbar_type'] = api.checkAttribute(req.navbar_type);
        json['is_dark'] = api.checkAttribute(req.is_dark);
        json['updated_by'] = api.checkAttribute(req.updated_by);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['created_at'] = api.checkAttribute(req.created_at);

        return json;
    }
};
