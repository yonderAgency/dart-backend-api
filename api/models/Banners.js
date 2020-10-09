/**
 * AdminProfile.js
 */
const moment = require('moment');
const api = require('./Api.js');

module.exports = {
    attributes: {
        title: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string',
            allowNull: true
        },
        hit_title1: {
            type: 'string',
            allowNull: true
        },
        hit_description1: {
            type: 'string',
            allowNull: true
        },

        hit_title2: {
            type: 'string',
            allowNull: true
        },
        hit_description2: {
            type: 'string',
            allowNull: true
        },

        hit_title3: {
            type: 'string',
            allowNull: true
        },
        hit_description3: {
            type: 'string',
            allowNull: true
        },

        hit_title4: {
            type: 'string',
            allowNull: true
        },
        hit_description4: {
            type: 'string',
            allowNull: true
        },
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
        json['title'] = api.checkAttribute(req.title);

        json['hit_title1'] = api.checkAttribute(req.hit_title1);
        json['hit_description1'] = api.checkAttribute(req.hit_description1);

        json['hit_title2'] = api.checkAttribute(req.hit_title2);
        json['hit_description2'] = api.checkAttribute(req.hit_description2);

        json['hit_title3'] = api.checkAttribute(req.hit_title3);
        json['hit_description3'] = api.checkAttribute(req.hit_description3);

        json['hit_title4'] = api.checkAttribute(req.hit_title4);
        json['hit_description4'] = api.checkAttribute(req.hit_description4);

        json['description'] = api.checkAttribute(req.description);
        json['image'] = Api.getBaseImages();

        if (
            typeof req.image != 'undefined' &&
            req.image != '' &&
            req.image != null
        ) {
            json['image'] = Api.getActualImages('/uploads/banners/', req.image);
        }

        return json;
    }
};
