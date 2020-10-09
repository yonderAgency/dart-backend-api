var moment = require('moment');

module.exports = {
    friendlyName: 'Get Timestamp',

    description: 'Get Timestamp.',

    inputs: {
        datetime: {
            type: 'string',
            example: '1520451268',
            description: 'The name of the person to greet.',
            required: true
        }
    },

    fn: async function(inputs, exits) {
        var value = await moment.utc(inputs.datetime).valueOf();
        return exits.success(value);
    }
};
