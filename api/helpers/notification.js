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
        },
        reference_type: {
            type: 'string',
            example: '1520451268',
            description: 'Returns a type',
            required: true
        },
        status: {
            type: 'number',
            example: 5,
            description: 'Returns a to whom notification is sent',
            required: true
        },
        reference_id: {
            type: 'string',
            example: '1520451268',
            description: 'Returns a reference id',
            required: true
        },
        log_error: {
            type: 'boolean',
            example: true,
            description: 'Returns a boolean',
            required: false
        }
    },

    fn: async function(inputs, exits) {
        i = 0;
        if (!inputs.log_error) {
            inputs.log_error = false;
        }
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
                        finalTokens.push(
                            userModel[0].tokens[x].player_id.trim()
                        );
                    }
                }
            }
            if (finalTokens.length > 0) {
                const packet = await generatepacket(
                    inputs.type,
                    inputs.variables
                );
                var notificationPacket = new OneSignal.Notification({
                    contents: packet,
                    include_player_ids: finalTokens
                });
                notificationPacket.postBody['data'] = inputs.dataPacket;
                notificationPacket.postBody['headings'] = await generateHeading(
                    inputs.type
                );
                // notificationPacket.postBody['send_after'] = 'Thu Sep 24 2015 14:00:00 GMT-0700 (PDT)';
                myClient.sendNotification(notificationPacket, async function(
                    err,
                    httpResponse,
                    data
                ) {
                    if (err) {
                        sails.sentry.captureException(err);
                        if (inputs.log_error) {
                            return exits.success(false);
                        }
                        return exits.success(true);
                    } else {
                        var onesignal_id = 'ERR' + (await Api.generatedCode(8));
                        if (!data.errors) {
                            onesignal_id = data.id;
                        }
                        const notificationset = {
                            onesignal_id: onesignal_id,
                            message: packet['en'],
                            reference_id: inputs.reference_id,
                            type: inputs.dataPacket.type,
                            created_by: inputs.user_id,
                            status: inputs.status,
                            route: inputs.dataPacket.route,
                            reference_type: inputs.reference_type
                        };
                        await Notifications.create(notificationset, function(
                            err,
                            category
                        ) {
                            if (err) {
                                sails.sentry.captureException(err);
                                return exits.success(true);
                            }
                            return exits.success(true);
                        });
                    }
                });
            } else {
                return exits.success(true);
            }
        }
    }
};
