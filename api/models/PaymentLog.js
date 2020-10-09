/**
 * PaymentLog.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        provider_id: {
            type: 'string',
            required: true
        },
        tokens: {
            type: 'json',
            required: true
        },
        amount: {
            type: 'number',
            defaultsTo: 0
        },
        created_at: {
            type: 'number',
            defaultsTo: 0
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        type_id: {
            type: 'number',
            defaultsTo: 1
        },
        created_by: {
            type: 'string',
            required: true
        }
    },

    schema: true,

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(limit = 10, req) {
        var json = {};

        json['provider_id'] = api.checkAttribute(req.provider_id);
        json['tokens'] = api.checkAttribute(req.tokens);
        json['amount'] = api.checkAttribute(req.amount);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['status'] = api.checkAttribute(req.status);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['created_at'] = api.checkAttribute(req.created_at);

        return json;
    }
};
