/**
 * Favoriteservice.js
 */
const moment = require('moment');

module.exports = {
    attributes: {
        favorite_id: {
            type: 'string',
            required: true
        },
        provider_id: {
            type: 'string',
            required: true
        },
        created_by: {
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
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    }
};
