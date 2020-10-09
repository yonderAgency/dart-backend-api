const bcrypt = require('bcrypt');

module.exports = async function login(req, res) {
    const response = { status: 'NOK', message: '', data: {} };
    const email = req.param('email');
    const password = req.param('password');
    const playerId = req.param('playerId');

    if (typeof email == 'undefined' || typeof password == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const existingUser = await User.find({
            email: email.toLowerCase(),
            role: [
                sails.config.constants.ROLE_ADMIN,
                sails.config.constants.ROLE_SUBADMIN
            ]
        }).limit(1);
        if (existingUser && existingUser.length > 0) {
            await bcrypt.compare(
                password,
                existingUser[0].password,
                async function(err, result) {
                    if (result) {
                        const tokenHash = await User.addUserToken(
                            existingUser[0],
                            playerId
                        );
                        if (tokenHash) {
                            var settings = await AdminSettings.find().limit(1);
                            if (settings && settings.length > 0) {
                                response.data.settings = await AdminSettings.getJson(
                                    settings[0]
                                );
                            }
                            response.message = sails.__('Success');
                            response.status = 'OK';
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
        } else {
            response.message = sails.__('Login failed wrong user credentials');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
