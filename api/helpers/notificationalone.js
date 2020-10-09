var OneSignal = require('onesignal-node');
var i = 0;
var replaceAt = function(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
};

var replacements = function(initialString, replacementArray) {
    index = initialString.indexOf('_');
    initialString = replaceAt(initialString, index, replacementArray[i]);
    if (initialString.indexOf('_') != -1) {
        i++;
        replacements(initialString, replacementArray);
    }
    return initialString;
};

var generateHeading = function(type, addString) {
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

var generatepacket = function(type, addString) {
    const languages = sails.config.dynamics.LANGUAGES;
    const notifications = sails.config.dynamics.NOTIFICATIONS;
    const messages = {};
    const replacementArray = addString.split(',');
    var finalMessage = '';
    if (notifications[type].indexOf('_') != -1) {
        finalMessage = replacements(notifications[type], replacementArray);
    } else {
        finalMessage = notifications[type];
    }
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
        user_id: {
            type: 'string',
            example: '1520451268',
            description: 'Returns a user id',
            required: true
        },
        type: {
            type: 'string',
            example: 'BOOKING_STARTED',
            description: 'Notification Type',
            required: true
        },
        variables: {
            type: 'string',
            example: 'Comma separated variables',
            description: 'Variables',
            required: false
        },
        dataPacket: {
            type: 'json',
            example: '',
            description: 'JSON',
            required: true
        }
    },

    fn: async function(inputs, exits) {
        i = 0;
        var finalTokens = [];
        var userModel = await User.find({
            id: inputs.user_id
        }).populate('tokens');
        var mainAuthKey = 'WRONG_KEY';
        var mainAppId = 'WRONG_ID';
        if (userModel.length > 0) {
            if (userModel[0].role == sails.config.constants.ROLE_PROVIDER) {
                mainAuthKey = sails.config.dynamics.ONESIGNAL_REST_PROVIDERKEY;
                mainAppId = sails.config.dynamics.ONESIGNAL_PROVIDER_APP_ID;
            } else if (
                userModel[0].role == sails.config.constants.ROLE_CUSTOMER
            ) {
                mainAuthKey = sails.config.dynamics.ONESIGNAL_REST_CUSTOMERKEY;
                mainAppId = sails.config.dynamics.ONESIGNAL_CUSTOMER_APP_ID;
            }
        }
        var myClient = new OneSignal.Client({
            userAuthKey: sails.config.dynamics.ONESIGNAL_AUTH_KEY,
            app: {
                appAuthKey: mainAuthKey,
                appId: mainAppId
            }
        });
        if (userModel[0].tokens.length > 0) {
            for (x in userModel[0].tokens) {
                if (userModel[0].tokens[x].player_id) {
                    finalTokens.push(userModel[0].tokens[x].player_id.trim());
                }
            }
        }
        if (finalTokens.length > 0) {
            const packet = await generatepacket(inputs.type, inputs.variables);
            var notificationPacket = new OneSignal.Notification({
                contents: packet,
                include_player_ids: finalTokens
            });
            notificationPacket.postBody['data'] = inputs.dataPacket;
            notificationPacket.postBody['headings'] = await generateHeading(
                inputs.type
            );
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
                return exits.success(true);
            });
        } else {
            return exits.success(false);
        }
    }
};
