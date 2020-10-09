/**
 * Token.js
*/

module.exports = {
    attributes: {
        token_value: {
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
        device_model: {
            type: 'string',
            allowNull: true
        },
        device_name: {
            type: 'string',
            allowNull: true
        },
        device_version: {
            type: 'string',
            allowNull: true
        },
        player_id: {
            type: 'string',
            allowNull: true
        },
        owner: {
            model: 'user'
        }
    }
};
