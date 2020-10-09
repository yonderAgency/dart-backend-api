/**
 * Social.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string',
            required: true,
            isEmail: true
        },
        type_id: {
            type: 'number',
            required: true
        },
        created_at: {
            type: 'number'
        },
        updated_by: {
            type: 'number',
            defaultsTo: 2
        },
        ipAddress: {
            type: 'json',
            columnType: 'array',
            required: true
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: function(req) {
        var json = {};

        json['social_id'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['email'] = api.checkAttribute(req.email);
        json['type_id'] = api.checkAttribute(req.type_id);

        return json;
    }
};
