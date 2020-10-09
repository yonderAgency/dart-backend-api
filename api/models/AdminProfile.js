/**
 * AdminProfile.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        image: {
            type: 'string',
            allowNull: true
        },
        created_at: {
            type: 'number'
        },
        created_by: {
            required: true,
            type: 'string'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['email'] = api.checkAttribute(req.email);
        json['role'] = api.checkAttribute(req.role);
        var profile = await AdminProfile.find({
            created_by: req.id
        }).limit(1);
        json['image'] = Api.getBaseImages();

        if (
            profile &&
            profile.length > 0 &&
            typeof profile[0].image != 'undefined' &&
            profile[0].image != '' &&
            profile[0].image != null
        ) {
            json['image'] = Api.getActualImages(
                '/uploads/profile/',
                profile[0].image
            );
        }

        return json;
    }
};
