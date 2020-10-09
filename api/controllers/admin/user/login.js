var bcrypt = require('bcrypt');

module.exports = async function login(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var email = req.param('email').toLowerCase();
    var password = req.param('password');
    var playerId = req.param('playerId');

    if (typeof email == 'undefined' || typeof password == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var existingUser = await User.find({
            email: email
        }).limit(1);

        if (existingUser && existingUser.length > 0) {
            if (
                existingUser[0].role === sails.config.constants.ROLE_ADMIN ||
                existingUser[0].role === sails.config.constants.ROLE_SUBADMIN
            ) {
                await bcrypt.compare(
                    password,
                    existingUser[0].password,
                    async function(err, result) {
                        if (result) {
                            var tokenHash = await User.addUserToken(
                                existingUser[0],
                                playerId
                            );
                            response.message = sails.__('Login successful');
                            response.status = 'OK';
                            response.data.token = tokenHash;
                            return res.json(response);
                        } else {
                            response.message = sails.__(
                                'Login failed wrong user credentials'
                            );
                            return res.json(response);
                        }
                    }
                );
            } else {
                response.message = sails.__('Invalid request');
                return res.json(response);
            }
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
