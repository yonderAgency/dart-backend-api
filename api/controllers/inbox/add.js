module.exports = async function add(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const message = req.param('text');
    const messageroom = req.param('messageroom');
    const toId = req.param('toId');
    const user = req.authUser;

    if (
        typeof messageroom == 'undefined' ||
        typeof message == 'undefined' ||
        typeof toId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (user && message) {
            var inboxExists = await Inbox.find({
                messageroom: messageroom,
                or: [
                    {
                        created_by: user.id
                    },
                    {
                        provider_id: user.id
                    }
                ]
            }).limit(1);
            if (inboxExists && inboxExists.length > 0) {
                await InboxMessages.create({
                    inbox_id: inboxExists[0].id,
                    message: message,
                    from_id: user.id,
                    to_id: toId
                });
                if (user.role == sails.config.constants.ROLE_CUSTOMER) {

                    await Inbox.update({
                        messageroom: messageroom
                    }).set({
                        provider_unread_count:
                            parseInt(inboxExists[0].provider_unread_count) + 1
                    });
                    await sails.helpers.notificationalone.with({
                        user_id: toId,
                        type: 'NEW_MESSAGE',
                        variables: user.name,
                        dataPacket: {
                            params: {
                                messageroom
                            },
                            type: sails.config.constants.RELOAD_BOOKING,
                            route: sails.config.constants.ROUTE_INBOX_DETAIL
                        }
                    });
                } else {
                    await Inbox.update({
                        messageroom: messageroom
                    }).set({
                        customer_unread_count:
                            parseInt(inboxExists[0].customer_unread_count) + 1
                    });
                    const profile = await ProviderProfile.find({
                        created_by: user.id
                    }).limit(1);
                    if (profile && profile.length > 0) {
                        await sails.helpers.notificationalone.with({
                            user_id: toId,
                            type: 'NEW_MESSAGE',
                            variables: profile[0].business_name,
                            dataPacket: {
                                params: {
                                    messageroom
                                },
                                type: sails.config.constants.RELOAD_BOOKING,
                                route: sails.config.constants.ROUTE_INBOX_DETAIL
                            }
                        });
                    }
                }
                response.status = 'OK';
                response.message = sails.__('Success');
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
