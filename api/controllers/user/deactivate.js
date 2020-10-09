const moment = require('moment');

module.exports = async function deactivate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const description = req.param('description');
    const user = req.authUser;

    if (typeof description == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        await User.update({
            id: user.id
        }).set({
            deleted_by: user.id,
            deletion_message: description,
            deleted_at: moment().valueOf(),
            is_deleted: sails.config.constants.IS_DELETED,
            ipAddress: User.pushIpData(
                Api.filterIp(req.ip),
                user.ipAddress,
                req.options.action
            )
        });
        let websiteImages = await Api.getWebsiteImage();
        sails.hooks.email.send(
            'deactivated-by-user',
            {
                name: user.name,
                image: websiteImages
            },
            {
                to: user.email,
                subject: sails.__(
                    'Account deactivated: %s',
                    sails.config.dynamics.APPLICATION_NAME
                )
            },
            async function(err) {
                if (err) {
                    sails.sentry.captureException(err);
                    response.message = err;
                    return res.json(response);
                }
                response.message = sails.__('Account deactivated successfully');
                response.status = 'OK';
                return res.json(response);
            }
        );
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
