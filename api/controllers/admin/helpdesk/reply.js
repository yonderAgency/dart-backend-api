module.exports = async function reply(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');
    const description = req.param('description');
    const loggedId = req.authUser.id;

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const helpdesk = await Helpdesk.find({
            id: id
        }).limit(1);

        if (helpdesk && helpdesk.length > 0) {
            await HelpdeskLog.create({
                helpdesk_id: id,
                description: description,
                created_by: loggedId
            });
            let websiteImages = await Api.getWebsiteImage();
            var toUser = await User.find({
                id: helpdesk[0].created_by
            }).limit(1);
            await Helpdesk.update({
                id: id
            }).set({
                status: sails.config.constants.HELPDESK_STATUS_INPROGRESS
            });
            if (toUser && toUser.length > 0) {
                sails.hooks.email.send(
                    'helpdesk-reply',
                    {
                        name: toUser[0].name,
                        image: websiteImages
                    },
                    {
                        to: toUser[0].email,
                        subject: sails.__(
                            'Help Ticket at %s',
                            sails.config.dynamics.APPLICATION_NAME
                        )
                    },
                    async function(err) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.message = sails.__('Unable to add reply');
                            response.data = await Helpdesk.getJson(
                                helpdesk[0],
                                true
                            );
                            return res.send(response);
                        }
                        response.status = 'OK';
                        response.message = sails.__('Success');
                        response.data = await Helpdesk.getJson(
                            helpdesk[0],
                            true
                        );
                        return res.send(response);
                    }
                );
            } else {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = await Helpdesk.getJson(helpdesk[0], true);
                return res.send(response);
            }
        } else {
            response.message = sails.__('Unable to fetch helpdesk details');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
