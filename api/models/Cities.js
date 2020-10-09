/**
 * Cms.js
 */
const moment = require('moment');

module.exports = {
    attributes: {
        city: {
            type: 'string',
            required: true
        },
        state: {
            type: 'string',
            defaultsTo: ''
        },
        country: {
            type: 'string',
            required: true
        },
        zipcode: {
            type: 'string',
            required: true
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        created_by: {
            type: 'string',
            allowNull: true
        },
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        deleted_by: {
            type: 'string',
            allowNull: true
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

        json['key'] = Api.checkAttribute(req.id);
        json['city'] = Api.checkAttribute(req.city);
        json['state'] = Api.checkAttribute(req.state);
        json['country'] = Api.checkAttribute(req.country);
        json['zipcode'] = Api.checkAttribute(req.zipcode);
        json['status'] = Api.checkAttribute(req.status);
        json['created_by'] = Api.checkAttribute(req.created_by);
        json['deleted_at'] = Api.checkAttribute(req.deleted_at);
        json['deleted_by'] = Api.checkAttribute(req.deleted_by);
        json['created_at'] = Api.checkAttribute(req.created_at);

        return json;
    }
};
