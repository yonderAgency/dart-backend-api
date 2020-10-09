const bcrypt = require('bcrypt');

module.exports = async function resetpassword(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const password = req.param('password');
    const token = req.param('token');
    const saltRounds = 10;

    if (typeof token == 'undefined' || typeof password == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        const userFound = await User.find({
            activation_key: token
        }).limit(1);
        if (typeof userFound !== 'undefined' && userFound.length > 0) {
            if (!userFound[0].activation_key) {
                response.message = sails.__('No token found');
                return res.json(response);
            } else if (userFound[0].activation_key != token) {
                response.message = sails.__('Invalid request');
                return res.json(response);
            } else {
                await bcrypt.hash(password, saltRounds, async function(
                    err,
                    hash
                ) {
                    await User.update({ activation_key: token }).set({
                        password: hash,
                        activation_key: null,
                        ipAddress: User.pushIpData(
                            Api.filterIp(req.ip),
                            userFound[0].ipAddress,
                            req.options.action
                        )
                    });
                    await Token.destroy({ owner: userFound[0].id });
                });
                let websiteImages = await Api.getWebsiteImage();
                sails.hooks.email.send(
                    'resetPassword',
                    {
                        name: userFound[0].name,
                        image: websiteImages
                    },
                    {
                        to: userFound[0].email,
                        subject: sails.__(
                            'Password Changed: %s',
                            sails.config.dynamics.APPLICATION_NAME
                        )
                    },
                    function(err) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.message = err;
                            return res.json(response);
                        }
                        response.status = 'OK';
                        response.message = sails.__('Password Changed');
                        return res.json(response);
                    }
                );
            }
        } else {
            response.message = sails.__('Invalid activation key');
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
