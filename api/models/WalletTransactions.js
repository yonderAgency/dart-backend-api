/**
 * WalletTransactions.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        wallet_id: {
            type: 'string',
            required: true
        },
        heading: {
            type: 'string',
            allowNull: true
        },
        amount: {
            type: 'number'
        },
        closing_balance: {
            type: 'number'
        },
        user_id: {
            type: 'string',
            required: true
        },
        transaction_id: {
            type: 'string',
            allowNull: true
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        type: {
            type: 'number',
            defaultsTo: 1
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

    getJson: async function(req) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['wallet_id'] = api.checkAttribute(req.wallet_id);
        json['heading'] = sails.__(api.checkAttribute(req.heading));
        json['amount'] = api.checkAttribute(req.amount);
        json['closing_balance'] = api.checkAttribute(req.closing_balance);
        json['user_id'] = api.checkAttribute(req.user_id);
        json['transaction_id'] = api.checkAttribute(req.transaction_id);
        json['status'] = api.checkAttribute(req.status);
        json['type'] = api.checkAttribute(req.type);
        json['created_at'] = req.created_at;
        json['created_by'] = api.checkAttribute(req.created_by);
        json['ipAddress'] =
            req.ipAddress && req.ipAddress.length > 0 ? req.ipAddress : [];
        return json;
    }
};
