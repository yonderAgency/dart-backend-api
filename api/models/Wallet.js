/**
 * Wallet.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        secret_code: {
            type: 'string',
            required: true
        },
        balance: {
            type: 'number'
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
        updated_at: {
            type: 'number'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req, length = 20, more = false) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['secret_code'] = api.checkAttribute(req.secret_code);
        json['balance'] = api.checkAttribute(req.balance);
        json['status'] = api.checkAttribute(req.status);
        json['type'] = api.checkAttribute(req.type);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['created_at'] = req.created_at;
        json['created_by'] = api.checkAttribute(req.created_by);
        json['updated_at'] = req.updated_at ? moment().valueOf() : 0;
        var transactionsJson = [];
        if (more == true) {
            json['transactions'] = [];
            var transactions = await WalletTransactions.find({
                wallet_id: req.id
            })
                .sort('created_at DESC')
                .limit(20);
            if (transactions.length > 0) {
                for (x in transactions) {
                    transactionsJson.push(
                        await WalletTransactions.getJson(transactions[x])
                    );
                }
                json['transactions'] = transactionsJson;
            }
        }
        return json;
    },

    generatedCode: async function(string_length = 6) {
        var chars =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        var randomstring = '';
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    },

    createSecret: async function() {
        return (
            sails.config.dynamics.WALLET_PREFIX + (await Api.generatedCode(8))
        );
    },

    createWallet: async function(user_id) {
        const wallet = await Wallet.find({
            created_by: user_id
        }).limit(1);
        if (wallet && wallet.length == 0) {
            await Wallet.create({
                secret_code: await this.createSecret(),
                balance: 0,
                created_by: user_id
            });
        }
    }
};
