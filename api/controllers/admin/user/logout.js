module.exports = async function logout(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var token = req.header('x-auth-token');
    if (!token) {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var exists = await Token.find({
            where: { token_value: token }
        });
        if (exists) {
            await Token.destroy({ token_value: token });
            response.status = 'OK';
            response.message = sails.__('Success');

            return res.json(response);
        } else {
            response.message = sails.__('No user found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
