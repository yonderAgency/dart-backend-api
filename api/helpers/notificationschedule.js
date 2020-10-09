var OneSignal = require('onesignal-node');

var generateHeading = function(type) {
    const languages = sails.config.dynamics.LANGUAGES;
    const notifications = sails.config.dynamics.NOTIFICATIONS_HEADING;
    const messages = {};
    var finalMessage = notifications[type];
    if (languages.length > 0) {
        for (x in languages) {
            messages[languages[x].language] = finalMessage;
        }
    }
    return messages;
};

var generatepacket = function(type) {
    const languages = sails.config.dynamics.LANGUAGES;
    const notifications = sails.config.dynamics.NOTIFICATIONS;
    const messages = {};
    var finalMessage = notifications[type];
    if (languages.length > 0) {
        for (x in languages) {
            messages[languages[x].language] = finalMessage;
        }
    }
    return messages;
};

module.exports = {
    friendlyName: 'Send Notifications',

    description: 'Send notification to users',

    inputs: {
        type: {
            type: 'string',
            example: 'BOOKING_STARTED',
            description: 'Notification Type',
            required: true
        },
        scheduleDate: {
            type: 'string',
            example: 'send date',
            description: 'Sending Date',
            required: false
        },
        dataPacket: {
            type: 'json',
            example: '',
            description: 'JSON',
            required: true
        },
        reference_type: {
            type: 'string',
            example: '',
            description: 'string',
            required: true
        }
    },

    fn: async function(inputs, exits) {
        i = 0;
        var finalTokens = [];
        var mainAuthKey = sails.config.dynamics.ONESIGNAL_REST_CUSTOMERKEY;
        var mainAppId = sails.config.dynamics.ONESIGNAL_CUSTOMER_APP_ID;
        var myClient = new OneSignal.Client({
            userAuthKey: sails.config.dynamics.ONESIGNAL_AUTH_KEY,
            app: {
                appAuthKey: mainAuthKey,
                appId: mainAppId
            }
        });
        const packet = await generatepacket(inputs.type);
        var notificationPacket = new OneSignal.Notification({
            contents: packet
        });
        notificationPacket.postBody['data'] = inputs.dataPacket;
        notificationPacket.postBody['headings'] = await generateHeading(
            inputs.type
        );
        notificationPacket.postBody['included_segments'] = ['Subscribed Users'];
        notificationPacket.postBody['send_after'] = inputs.scheduleDate;
        myClient.sendNotification(notificationPacket, async function(
            err,
            httpResponse,
            data
        ) {
            if (err) {
                sails.log.error(err);
                return exits.success(false);
            }
            if (data.errors && data.errors.length > 0) {
                sails.log.error(data.errors);
                return exits.success(false);
            }
            const notificationset = {
                onesignal_id: data.id,
                message: packet['en'],
                type: inputs.dataPacket.type,
                status:
                    sails.config.constants.NOTIFICATION_STATUS_FOR_CUSTOMERS,
                route: inputs.dataPacket.route,
                reference_type: inputs.reference_type
            };
            await Notifications.create(notificationset, function(
                err,
                category
            ) {
                if (err) {
                    return exits.success(false);
                }
                return exits.success(true);
            });
        });
    }
};
