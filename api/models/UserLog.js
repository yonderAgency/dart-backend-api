/**
 * UserLog.js
 */

module.exports = {
    attributes: {
        ip: {
            type: 'string',
            allowNull: true
        },
        attempt: {
            type: 'number'
        },
        status: {
            type: 'number',
            allowNull: true
        },
        location: {
            type: 'string',
            allowNull: true
        },
        created_at: {
            type: 'number'
        },
        device_description: {
            type: 'string'
        },
        device_id: {
            type: 'string'
        }
    }
};
