const moment = require('moment');
const _ = require('lodash');

module.exports = async function refresh(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const bottomTime = req.param('bottomTime') || moment().valueOf();
    const messageroom = req.param('messageroom');
    const type = req.param('type');
    var user = req.authUser;

    if (typeof messageroom == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (user && messageroom) {
            var chats = [];
            var isCustomer = true;
            if (user.role == sails.config.constants.ROLE_PROVIDER) {
                isCustomer = false;
            }
            var inbox = await Inbox.find({
                messageroom: messageroom
            });
            if (inbox.length > 0) {
                var messages = await InboxMessages.find({
                    where: {
                        inbox_id: inbox[0].id,
                        created_at: {
                            '>': bottomTime
                        }
                    }
                }).sort('created_at DESC');
                if (messages.length > 0) {
                    for (var x = 0; x < messages.length; x++) {
                        chats.push(await InboxMessages.getJson(messages[x]));
                    }
                }
                if (isCustomer) {
                    await Inbox.update({
                        messageroom: messageroom
                    }).set({
                        customer_unread_count: 0
                    });
                } else {
                    await Inbox.update({
                        messageroom: messageroom
                    }).set({
                        provider_unread_count: 0
                    });
                }
                response.status = 'OK';
                response.message = sails.__('Success');
                if (type) {
                    chats = _.reverse(chats);
                }
                response.data = {
                    chats: chats
                };
                return res.json(response);
            }
            response.message = sails.__('Invalid request');
            return res.json(response);
        } else {
            response.message = sails.__('Invalid request');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
