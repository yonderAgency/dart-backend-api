/**
 * Cms.js
 */
const moment = require('moment');
const api = require('../models/Api');

module.exports = {
    attributes: {
        title: {
            type: 'string',
            required: true
        },
        sub_title: {
            type: 'string',
            defaultsTo: ''
        },
        description: {
            type: 'string',
            required: true
        },
        meta_title: {
            type: 'string',
            required: true
        },
        meta_description: {
            type: 'string',
            required: true
        },
        meta_keywords: {
            type: 'string',
            required: true
        },
        slug: {
            type: 'string',
            required: true
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        type_id: {
            type: 'number',
            defaultsTo: 1
        },
        created_at: {
            type: 'number'
        },
        updated_at: {
            type: 'number',
            allowNull: true
        },
        created_by: {
            type: 'string',
            allowNull: true
        },
        deletable: {
            type: 'number',
            defaultsTo: 1
        },
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        deleted_by: {
            type: 'string',
            allowNull: true
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
        json['sub_title'] = api.checkAttribute(req.sub_title);
        json['description'] = api.checkAttribute(req.description);
        json['meta_title'] = api.checkAttribute(req.meta_title);
        json['meta_description'] = api.checkAttribute(req.meta_description);
        json['meta_keywords'] = api.checkAttribute(req.meta_keywords);
        json['status'] = api.checkAttribute(req.status);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['deletable'] = api.checkAttribute(req.deletable);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['slug'] = api.checkAttribute(req.slug);

        return json;
    },

    getSlug: async function(string, repeat = '') {
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
        const cms = await Cms.find({
            slug: slug
        }).limit(1);
        if (cms && cms.length > 0) {
            await cms.getSlug(string, cms[0].created_at + '');
        }
        if (slug == '') {
            slug = await Api.generatedCode(5);
        }
        return slug;
    },

    getMenuJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['title'] = api.checkAttribute(req.title);
        json['slug'] = api.checkAttribute(req.slug);

        return json;
    }
};
