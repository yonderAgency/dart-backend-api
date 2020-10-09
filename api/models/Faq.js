/**
 * Faq.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        question: {
            type: 'string',
            required: true
        },
        answer: {
            type: 'string',
            required: true
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2
        },
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        created_at: {
            type: 'number'
        },
        type_id: {
            type: 'number',
            defaultsTo: 1
        },
        provider_service_id: {
            required: true,
            type: 'string'
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
        json['question'] = api.checkAttribute(req.question);
        json['answer'] = api.checkAttribute(req.answer);
        json['provider_service_id'] = api.checkAttribute(
            req.provider_service_id
        );
        json['created_at'] = api.checkAttribute(req.created_at);
        return json;
    }
};
