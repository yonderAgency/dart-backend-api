const saltRounds = 10;
const bcrypt = require('bcrypt');

module.exports = async function changePassword(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const password = req.param('password');
    const newPassword = req.param('newPassword');
    const userFound = req.authUser;

    try {
        await bcrypt.compare(password, userFound.password, async function(
            err,
            result
        ) {
            if (result) {
                await bcrypt.hash(newPassword, saltRounds, async function(
                    err,
                    hashNew
                ) {
                    if (err) {
                        response.message = err;
                        return res.json(response);
                    }
                    await User.update({
                        id: userFound.id
                    }).set({
                        password: hashNew,
                        ipAddress: User.pushIpData(
                            Api.filterIp(req.ip),
                            userFound.ipAddress,
                            req.options.action
                        )
                    });
                    if (hashNew) {
                        await Api.removeOtherTokens(
                            userFound.id,
                            req.headers['x-auth-token']
                        );
                        let websiteImages = await Api.getWebsiteImage();
                        sails.hooks.email.send(
                            'changepassword',
                            {
                                name: userFound.name,
                                image: websiteImages
                            },
                            {
                                to: userFound.email,
                                subject: sails.__(
                                    'Account password changed: %s',
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
                                    'Password changed successfully'
                                );
                                response.status = 'OK';
                                return res.json(response);
                            }
                        );
                    } else {
                        response.message = sails.__(
                            'Unable to change password'
                        );
                        return res.json(response);
                    }
                });
            } else {
                response.message = sails.__('Old Password is not correct');
                return res.json(response);
            }
        });
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
