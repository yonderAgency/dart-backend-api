/**
 * HelpdeskLog.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        description: {
            type: 'string',
            required: true
        },
        helpdesk_id: {
            type: 'string',
            required: true
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        created_at: {
            type: 'number'
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
        json['created_at'] = api.checkAttribute(req.created_at);
        json['status'] = api.checkAttribute(req.status);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['name'] = '';
        var user = await User.find({
            id: req.created_by
        }).limit(1);
        if (user && user.length > 0) {
            json['name'] = user[0].name;
        }

        return json;
    }
};
