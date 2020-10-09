module.exports = async function logout(req, res) {
    const response = { status: 'NOK', message: '', data: {} };
    var userId = null;
    if (typeof req.authUser != 'undefined') {
        userId = req.authUser.id;
    }
    try {
        if (userId) {
            await Api.removeToken(userId, req.headers['x-auth-token']);
            response.message = sails.__('Logged out successfully');
            response.status = 'OK';
            return res.json(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('User not found');
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
