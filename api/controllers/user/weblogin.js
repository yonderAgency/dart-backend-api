const bcrypt = require('bcrypt');

module.exports = async function weblogin(req, res) {
    const response = { status: 'NOK', message: '', data: {} };
    var email = req.param('email');
    const password = req.param('password');
    const playerId = req.param('playerId');

    if (typeof email == 'undefined' && typeof password == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    } else {
        email = email.toLowerCase();
    }

    try {
        const existingUser = await User.find({
            email: email
        }).limit(1);
        let generatedOtp = User.getRandomOtp(6);
        if (existingUser && existingUser.length > 0) {
            if (
                existingUser[0].is_blocked == sails.config.constants.IS_BLOCKED
            ) {
                response.type = sails.config.constants.AUTH_TYPE_BLOCKED;
                response.message = sails.__('Your account is blocked');
                return res.send(response);
            }
            if (
                existingUser[0].is_deleted == sails.config.constants.IS_DELETED
            ) {
                if (existingUser[0].deleted_by == existingUser[0].id) {
                    await bcrypt.compare(
                        password,
                        existingUser[0].password,
                        async function(err, result) {
                            if (result) {
                                var tokenHash = await User.addUserToken(
                                    existingUser[0],
                                    playerId
                                );
                                if (tokenHash) {
                                    await User.update({
                                        id: existingUser[0].id
                                    }).set({
                                        is_deleted:
                                            sails.config.constants.IS_ACTIVE,
                                        deletion_message: '',
                                        ipAddress: User.pushIpData(
                                            Api.filterIp(req.ip),
                                            existingUser[0].ipAddress,
                                            req.options.action
                                        )
                                    });
                                    let websiteImages = await Api.getWebsiteImage();
                                    sails.hooks.email.send(
                                        'welcome-back',
                                        {
                                            name: existingUser[0].name,
                                            image: websiteImages
                                        },
                                        {
                                            to: existingUser[0].name,
                                            subject: sails.__(
                                                'Welcome back %s',
                                                sails.config.dynamics
                                                    .APPLICATION_NAME
                                            )
                                        },
                                        async function(err) {
                                            if (err) {
                                                sails.sentry.captureException(
                                                    err
                                                );
                                            }
                                            response.message = sails.__(
                                                'Welcome back!'
                                            );
                                            response.status = 'OK';
                                            response.data.role =
                                                existingUser[0].role;
                                            response.data.token = tokenHash;
                                            return res.json(response);
                                        }
                                    );
                                }
                            } else {
                                response.message = sails.__(
                                    'Login failed wrong user credentials'
                                );
                                return res.json(response);
                            }
                        }
                    );
                } else {
                    response.message =
                        'Your account is inactive, please contact admin to re-activate your account';
                    return res.json(response);
                }
            }
            if (
                existingUser[0].status ===
                sails.config.constants.STATUS_INACTIVE
            ) {
                response.message = sails.__(
                    'Your account is inactive, please contact admin to re-activate your account'
                );
                return res.json(response);
            }
            if (
                existingUser[0].status === sails.config.constants.STATUS_ACTIVE
            ) {
                if (existingUser[0].is_email_verified == false) {
                    let websiteImages = await Api.getWebsiteImage();

                    sails.hooks.email.send(
                        'verification',
                        {
                            name: existingUser[0].name,
                            otp: generatedOtp,
                            image: websiteImages
                        },
                        {
                            to: email,
                            subject: sails.__(
                                'Email Verification %s',
                                sails.config.dynamics.APPLICATION_NAME
                            )
                        },
                        async function(err) {
                            if (err) {
                                sails.sentry.captureException(err);
                                response.message = err;
                                return res.json(response);
                            }
                            await User.update({
                                email: email
                            }).set({
                                otp: generatedOtp,
                                ipAddress: User.pushIpData(
                                    Api.filterIp(req.ip),
                                    existingUser[0].ipAddress,
                                    req.options.action
                                )
                            });
                            response.status = 'NOV';
                            response.data.role = existingUser[0].role;
                            response.message = sails.__(
                                'You are not verified user, verify your email first'
                            );

                            return res.json(response);
                        }
                    );
                } else {
                    await bcrypt.compare(
                        password,
                        existingUser[0].password,
                        async function(err, result) {
                            if (result) {
                                var tokenHash = await User.addUserToken(
                                    existingUser[0],
                                    playerId
                                );
                                if (tokenHash) {
                                    response.message = sails.__('Success');
                                    response.status = 'OK';
                                    response.data.role = existingUser[0].role;
                                    response.data.token = tokenHash;
                                    return res.json(response);
                                }
                            } else {
                                response.message = sails.__(
                                    'Login failed wrong user credentials'
                                );
                                return res.json(response);
                            }
                        }
                    );
                }
            }
        } else {
            response.message = sails.__("User with this email doesn't exist");
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
