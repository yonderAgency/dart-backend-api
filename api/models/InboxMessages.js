/**
 * InboxMessages.js
 */

const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        inbox_id: {
            required: true,
            type: 'string'
        },
        booking_id: {
            required: false,
            type: 'string'
        },
        message: {
            required: false,
            type: 'string'
        },
        image: {
            type: 'string',
            required: false
        },
        from_id: {
            required: true,
            type: 'string'
        },
        to_id: {
            required: true,
            type: 'string'
        },
        created_at: {
            type: 'number'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req) {
        var json = {};
        json['_id'] = api.checkAttribute(req.id) + '';
        json['inbox_id'] = api.checkAttribute(req.inbox_id);
        json['booking_id'] = api.checkAttribute(req.booking_id);
        json['text'] = api.checkAttribute(req.message);
        var user = await User.find({
            id: req.from_id
        }).limit(1);
        id = '';
        name = '';
        avatar = '';
        if (user && user.length > 0) {
            if (user[0].role == sails.config.constants.ROLE_CUSTOMER) {
                id = user[0].id;
                name = user[0].name;
                const custProfileData = await CustomerProfile.getData(
                    user[0].id
                );
                if (custProfileData && custProfileData.image) {
                    avatar = Api.getActualImages(
                        '/uploads/profile/',
                        custProfileData.image,
                        1
                    );
                } else {
                    avatar = Api.getBaseImages(1);
                }
            } else {
                id = user[0].id;
                const providerProfileData = await ProviderProfile.getData(
                    user[0].id
                );
                if (providerProfileData && providerProfileData.logo) {
                    name = providerProfileData.business_name;
                    avatar = Api.getActualImages(
                        '/uploads/profile/',
                        providerProfileData.logo,
                        1
                    );
                } else {
                    avatar = Api.getBaseImages(1);
                }
            }
        }
        var userObject = {
            _id: id,
            name: name,
            avatar: avatar
        };
        json['image'] = null;
        if (req && req.image && req.image != '') {
            json['image'] = Api.getActualImages(
                '/uploads/inbox/',
                req.image,
                2
            );
        }
        json['user'] = userObject;
        json['created_at'] = api.checkAttribute(req.created_at);
        return json;
    }
};
