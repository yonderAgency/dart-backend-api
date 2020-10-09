/**
 * WelcomeScreens.js
 */
const moment = require('moment');
const api = require('./Api.js');

module.exports = {
    attributes: {
        title: {
            type: 'string',
            required: true
        },
        sub_title: {
            type: 'string',
            allowNull: true
        },
        animation_json: {
            type: 'string',
            allowNull: true
        },
        created_at: {
            type: 'number'
        },
        created_by: {
            type: 'string',
            required: true
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

    getJson: async function(req, admin = false) {
        let json = {};

        json['title'] = api.checkAttribute(req.title);
        json['sub_title'] = api.checkAttribute(req.sub_title);
        json['order'] = api.checkAttribute(req.order);
        json['animation_json'] =
            api.checkAttribute(req.animation_json) &&
            req.animation_json.length > 0
                ? sails.config.constants.BASE_URL +
                  '/uploads/animations/' +
                  req.animation_json
                : '';
        json['created_at'] = api.checkAttribute(req.created_at);
        if (admin == true) {
            json['created_by'] = api.checkAttribute(req.created_by);
            json['ipAddress'] = api.checkAttribute(req.ipAddress);
        }

        return json;
    }
};
