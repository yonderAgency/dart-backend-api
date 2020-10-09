/**
 * Rating.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        r1: {
            type: 'number',
            defaultsTo: 2
        },
        r2: {
            type: 'number',
            defaultsTo: 2
        },
        r3: {
            type: 'number',
            defaultsTo: 2
        },
        booking_id: {
            type: 'string',
            required: true
        },
        review: {
            type: 'string',
            allowNull: true
        },
        ar: {
            type: 'number',
            defaultsTo: 2
        },
        to_id: {
            type: 'string',
            required: true
        },
        from_id: {
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
        created_at: {
            type: 'number'
        },
        has_reviewed: {
            type: 'number',
            defaultsTo: 2
        },
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        deleted_by: {
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
        const user = await User.find({
            id: req.from_id
        }).limit(1);
        if (user.length > 0) {
            if (user[0].role == sails.config.constants.ROLE_CUSTOMER) {
                json['name'] = api.checkAttribute(user[0].name);
                json['proImage'] = Api.getBaseImages();
                const profileData = await CustomerProfile.getData(user[0].id);
                if (profileData) {
                    if (profileData.image) {
                        json['proImage'] = Api.getActualImages(
                            '/uploads/profile/',
                            profileData.image
                        );
                    } else {
                        json['proImage'] = Api.getBaseImages();
                    }
                }
            } else {
                const profileData = await ProviderProfile.getData(user[0].id);
                if (profileData) {
                    json['name'] = api.checkAttribute(
                        profileData.business_name
                    );
                    if (profileData.logo) {
                        json['proImage'] = Api.getActualImages(
                            '/uploads/profile/',
                            profileData.logo
                        );
                    } else {
                        json['proImage'] = Api.getBaseImages();
                    }
                }
            }
        }
        const toUser = await User.find({
            id: req.to_id
        }).limit(1);
        if (toUser.length > 0) {
            if (toUser[0].role == sails.config.constants.ROLE_CUSTOMER) {
                json['toName'] = api.checkAttribute(toUser[0].name);
                json['toProImage'] = Api.getBaseImages();
                const profileData = await CustomerProfile.getData(toUser[0].id);
                if (profileData) {
                    if (profileData.image) {
                        json['toProImage'] = Api.getActualImages(
                            '/uploads/profile/',
                            profileData.image
                        );
                    } else {
                        json['toProImage'] = Api.getBaseImages();
                    }
                }
            } else {
                const profileData = await ProviderProfile.getData(toUser[0].id);
                if (profileData) {
                    json['toName'] = api.checkAttribute(
                        profileData.business_name
                    );
                    if (profileData.logo) {
                        json['toProImage'] = Api.getActualImages(
                            '/uploads/profile/',
                            profileData.logo
                        );
                    } else {
                        json['toProImage'] = Api.getBaseImages();
                    }
                }
            }
        }
        json['key'] = api.checkAttribute(req.id);
        json['r1'] = api.checkAttribute(req.r1).toFixed(2);
        json['r2'] = api.checkAttribute(req.r2).toFixed(2);
        json['r3'] = api.checkAttribute(req.r3).toFixed(2);
        json['ar'] = api.checkAttribute(req.ar).toFixed(2);
        json['status'] = api.checkAttribute(req.status);
        json['review'] = api.checkAttribute(req.review);
        json['booking_id'] = '';
        json['booking_token'] = '';
        if (req.booking_id) {
            var booking = await Booking.find({
                id: req.booking_id
            }).limit(1);
            if (booking && booking.length > 0) {
                json['booking_id'] = booking[0].id;
                json['booking_token'] = booking[0].token;
            }
        }
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        json['created_at'] = api.checkAttribute(req.created_at);
        return json;
    }
};
