module.exports = async function reactivate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const token = req.param('token');

    if (!token || typeof token == 'undefined' || token == null) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const user = await User.find({
            activation_key: token
        }).limit(1);
        if (user) {
            if (user.activation_key == token) {
                await User.update({
                    id: user.id
                }).set({
                    deleted_by: null,
                    deleted_at: null,
                    is_deleted: sails.config.constants.IS_ACTIVE,
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        user[0].ipAddress,
                        req.options.action
                    )
                });
                sails.hooks.email.send(
                    'welcome-back',
                    {
                        name: user.name,
                        image: websiteImages
                    },
                    {
                        to: user.email,
                        subject: sails.__(
                            'Account reactivated: %s',
                            sails.config.dynamics.APPLICATION_NAME
                        )
                    },
                    async function(err) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.message = err;
                            return res.json(response);
                        }
                        response.message = sails.__(
                            'Account reactivated successfully'
                        );
                        response.status = 'OK';
                        return res.json(response);
                    }
                );
            } else {
                response.message = sails.__('Invalid request');
                return res.json(response);
            }
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
