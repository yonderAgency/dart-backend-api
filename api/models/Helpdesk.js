/**
 * Helpdesk.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        description: {
            type: 'string',
            required: true
        },
        category: {
            type: 'number'
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
            required: true
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req, th = false) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['description'] = api.checkAttribute(req.description);
        json['status'] = api.checkAttribute(req.status);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['category_id'] = api.checkAttribute(req.category);

        json['category'] = '';
        for (x in sails.config.dynamics.HELPDESK_MESSAGES) {
            if (
                sails.config.dynamics.HELPDESK_MESSAGES[x].id == req.category
            ) {
                json['category'] = sails.__(
                    sails.config.dynamics.HELPDESK_MESSAGES[x].message
                );
            }
        }

        if (th == true) {
            var threads = await HelpdeskLog.find({
                helpdesk_id: req.id
            });
            var thread = [];
            if (threads.length > 0) {
                for (x in threads) {
                    thread.push(await HelpdeskLog.getJson(threads[x]));
                }
            }
            json['thread'] = thread;
        }
        return json;
    }
};
