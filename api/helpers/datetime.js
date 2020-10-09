var moment = require('moment');

module.exports = {
    friendlyName: 'Format Date Time',

    description: 'Return a personalized Date Time .',

    inputs: {
        datetime: {
            type: 'string',
            example: '1520451268',
            description: 'Return a personalized Date Time',
            required: true
        }
    },

    fn: async function(inputs, exits) {
        var value = await moment
            .utc(inputs.datetime * 1000)
            .format('DD MMM,YYYY hh:mm:ss a');
        return exits.success(value);
    }
};
