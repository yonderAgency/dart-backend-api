/**
 * Inbox.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        messageroom: {
            required: true,
            type: 'string'
        },
        type_id: {
            defaultsTo: 1,
            type: 'number'
        },
        status: {
            defaultsTo: 1,
            type: 'number'
        },
        created_at: {
            type: 'number'
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2
        },
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        created_by: {
            type: 'string',
            required: true
        },
        provider_id: {
            type: 'string',
            required: true
        },
        customer_unread_count: {
            type: 'number',
            defaultsTo: 0
        },
        provider_unread_count: {
            type: 'number',
            defaultsTo: 0
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getRoomToken: async function(string_length = 12) {
        var chars = '0123456789ABCDEFGHJKMNOPQRSTUVWXTZabcdefghkmnopqrstuvwxyz';
        var randomstring = '';
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    },

    createAccepted: async function(booking) {
        let exists = await Inbox.find({
            created_by: booking.created_by,
            provider_id: booking.provider_id
        }).limit(1);
        if (exists && exists.length > 0) {
            await InboxMessages.create({
                inbox_id: exists[0].id,
                message: sails.config.constants.PROVIDER_INBOX_DEFAULT,
                from_id: exists[0].provider_id,
                to_id: booking.created_by,
                booking_id: booking.id
            });
        } else {
            const messageRoomToken = await this.getRoomToken();
            await Inbox.create({
                messageroom: messageRoomToken,
                created_by: booking.created_by,
                provider_id: booking.provider_id
            });
            let createdInbox = await Inbox.find({
                messageroom: messageRoomToken
            }).limit(1);
            if (createdInbox && createdInbox.length > 0) {
                let proProfile = await ProviderProfile.find({
                    created_by: booking.provider_id
                }).limit(1);
                await InboxMessages.create({
                    inbox_id: createdInbox[0].id,
                    message:
                        proProfile && proProfile.length > 0
                            ? proProfile[0].inbox_message
                            : sails.config.constants.PROVIDER_INBOX_DEFAULT,
                    from_id: createdInbox[0].provider_id,
                    to_id: booking.created_by,
                    booking_id: booking.id
                });
            }
        }
    },

    getUnread: async function(id, customer = true) {
        var inboxExists = await Inbox.find({
            or: [
                {
                    created_by: id
                },
                {
                    provider_id: id
                }
            ]
        }).limit(1);
        if (inboxExists && inboxExists.length > 0) {
            if (customer) {
                return inboxExists[0].customer_unread_count;
            }
            return inboxExists[0].provider_unread_count;
        }
        return 0;
    },

    getJson: async function(req, more, size, topTime) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['messageroom'] = api.checkAttribute(req.messageroom);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['status'] = api.checkAttribute(req.status);
        json['is_deleted'] = api.checkAttribute(req.is_deleted);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['provider_id'] = api.checkAttribute(req.provider_id);
        json['providerUnreadCount'] = req.provider_unread_count;
        json['customerUnreadCount'] = req.customer_unread_count;

        var user = await User.find({
            id: req.created_by
        }).limit(1);
        if (user && user.length > 0) {
            const custProfileData = await CustomerProfile.getData(user[0].id);
            if (custProfileData && custProfileData.image) {
                avatar = Api.getActualImages(
                    '/uploads/profile/',
                    custProfileData.image,
                    1
                );
            } else {
                avatar = Api.getBaseImages(1);
            }
            json['customer'] = {
                _id: user[0].id,
                name: user[0].name,
                avatar: avatar
            };
        }
        var provider = await User.find({
            id: req.provider_id
        }).limit(1);
        if (provider && provider.length > 0) {
            id = provider[0].id;
            const providerProfileData = await ProviderProfile.getData(
                provider[0].id
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
            json['provider'] = {
                _id: provider[0].id,
                name: provider[0].name,
                avatar: avatar
            };
        }
        json['created_at'] = api.checkAttribute(req.created_at);

        const totalCount = await InboxMessages.count({
            inbox_id: req.id
        });
        json['total'] = totalCount;
        json['nextPage'] = false;
        if (more == 'true') {
            var chats = [];
            var messages = await InboxMessages.find({
                where: {
                    inbox_id: req.id,
                    created_at: {
                        '<': topTime
                    }
                }
            })
                .sort('created_at DESC')
                .limit(size);
            json['topTime'] = moment().valueOf();
            if (messages.length > 0) {
                for (var x = 0; x < messages.length; x++) {
                    if (x == messages.length - 1) {
                        json['topTime'] = messages[x].created_at;
                    }
                    chats.push(await InboxMessages.getJson(messages[x]));
                }
            }
            const leftMessageCount = await InboxMessages.count({
                where: {
                    inbox_id: req.id,
                    created_at: {
                        '<': json['topTime']
                    }
                }
            });
            if (leftMessageCount > 0) {
                json['nextPage'] = true;
            }
            json['chats'] = chats;
        } else {
            var chats = [];
            var messages = await InboxMessages.find({
                inbox_id: req.id
            })
                .sort('created_at DESC')
                .limit(1);
            if (messages.length > 0) {
                json['lastMessage'] = messages[0].message;
            }
        }
        return json;
    }
};
