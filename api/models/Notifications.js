/**
 * Notifications.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        onesignal_id: {
            type: 'string',
            required: true
        },
        message: {
            type: 'string',
            required: true
        },
        reference_id: {
            type: 'string',
            allowNull: true
        },
        route: {
            type: 'string',
            allowNull: true
        },
        created_at: {
            type: 'number'
        },
        is_read: {
            type: 'number',
            defaultsTo: 2
        },
        reference_type: {
            type: 'number',
            defaultsTo: 1
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        type: {
            type: 'string',
            allowNull: true
        },
        created_by: {
            type: 'string',
            allowNull: true
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['onesignal_id'] = api.checkAttribute(req.onesignal_id);
        json['created_at'] = api.checkAttribute(req.created_at / 1000);
        json['is_read'] = api.checkAttribute(req.is_read);
        json['status'] = api.checkAttribute(req.status);
        let mainroute = req.route;
        json['route'] = api.checkAttribute(mainroute);
        json['webroute'] = sails.config.constants.WEB_ROUTES[mainroute];
        var payloadType = 'offers';
        if (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14].indexOf(req.reference_type)
        ) {
            payloadType = 'booking';
        } else if (req.reference_type == 12) {
            payloadType = 'inbox';
        }
        json['notification'] = {
            payload: {
                notificationID: api.checkAttribute(req.id),
                additionalData: {
                    params: {
                        bookingDetail: {
                            key: api.checkAttribute(req.reference_id)
                        }
                    },
                    route: api.checkAttribute(req.route),
                    type: payloadType
                },
                body: api.checkAttribute(req.message),
                title: sails.__(
                    sails.config.dynamics.NOTIFICATIONS_HEADING[
                        Object.keys(sails.config.constants.NOTIFICATIONS)[
                            req.reference_type - 1
                        ]
                    ]
                )
            }
        };
        console.log({
            heading:
                sails.config.dynamics.NOTIFICATIONS_HEADING[
                    Object.keys(sails.config.constants.NOTIFICATIONS)[
                        req.reference_type - 1
                    ]
                ],
            dynamicHeading: sails.__(
                sails.config.dynamics.NOTIFICATIONS_HEADING[
                    Object.keys(sails.config.constants.NOTIFICATIONS)[
                        req.reference_type - 1
                    ]
                ]
            )
        });
        const notifications = sails.config.dynamics.NOTIFICATIONS_HEADING;
        json['heading'] = notifications[req.type];

        return json;
    },

    getMyTags: function(user) {
        if (user.role == sails.config.constants.ROLE_PROVIDER) {
            return [
                sails.config.constants.NOTIFICATION_STATUS_FOR_ALL,
                sails.config.constants.NOTIFICATION_STATUS_FOR_PROVIDERS
            ];
        } else if (user.role == sails.config.constants.ROLE_CUSTOMER) {
            return [
                sails.config.constants.NOTIFICATION_STATUS_FOR_ALL,
                sails.config.constants.NOTIFICATION_STATUS_FOR_CUSTOMERS
            ];
        }
        return [sails.config.constants.NOTIFICATION_STATUS_FOR_ALL];
    }
};
