var twilio = require('twilio');

module.exports = {
    friendlyName: 'Send Sms',

    description: 'Sends a sms to user',

    inputs: {
        otp: {
            type: 'number',
            required: true
        },
        number: {
            type: 'string',
            required: true
        }
    },

    fn: async function(inputs, exits) {
        var accountSid = sails.config.dynamics.TWILIO_ACCOUNT_SID;
        var authToken = sails.config.dynamics.TWILIO_AUTH_TOKEN;
        if (
            accountSid &&
            accountSid.length > 0 &&
            authToken &&
            authToken.length > 0
        ) {
            var client = new twilio(accountSid, authToken);
            var otp = inputs.otp;
            try {
                var message = await client.messages.create({
                    body:
                        'Your verification OTP for ' +
                        sails.config.dynamics.APPLICATION_NAME +
                        ' is ' +
                        otp,
                    to: inputs.number,
                    from: sails.config.dynamics.TWILIO_PHONE
                });
            } catch (err) {
                return exits.success({
                    statusCode: err.status,
                    code: err.code,
                    message: err.message
                });
            }
            if (message) {
                return exits.success({ ...message, statusCode: 200 });
            }
        } else {
            return exits.success({
                statusCode: 000,
                code: 000,
                message: 'No twilio settings found'
            });
        }
    }
};
