/**
 * ProviderLog.js
 */
const moment = require('moment');

module.exports = {
    attributes: {
        ip: {
            type: 'string',
            allowNull: true
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
        provider_id: {
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
    }
};
