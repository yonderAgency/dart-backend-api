var moment = require('moment');

module.exports = {
    friendlyName: 'Format Date',

    description: 'Return a personalized Date .',

    inputs: {
        datetime: {
            type: 'string',
            example: '1520451268',
            description: 'Return a personalized Date Time',
            required: true
        }
    },

    init: async function() {
        var myClient = new OneSignal.Client({
            userAuthKey: 'XXXXXX',
            app: { appAuthKey: 'XXXXX', appId: 'XXXXX' }
        });
        return myClient;
    },

    fn: async function(inputs, exits) {
        var value = await moment
            .utc(inputs.datetime * 1000)
            .format('DD MMM, YYYY');
        return exits.success(value);
    }
};
