module.exports = async function image(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var file = req.file('file');
    const user = req.authUser;
    const toId = req.param('toId');
    const messageroom = req.param('messageroom');

    if (typeof file == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
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
            let filename = await Api.uploadFileImage(file, '/inbox');
            if (filename != '') {
                await InboxMessages.create({
                    inbox_id: inboxExists[0].id,
                    image: filename,
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
            } else {
                response.message = sails.__('Unable to upload file');
                return res.json(response);
            }
        } else {
            response.message = sails.__('Unable to find selected inbox data');
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
