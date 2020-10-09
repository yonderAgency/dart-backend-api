module.exports = async function check(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const admin = req.authUser;

    if (typeof admin == 'undefined') {
        response.message = sails.__('Invalid request');
    }

    try {
        response.status = 'OK';
        response.data = await AdminProfile.getJson(admin);
        response.message = sails.__('Success');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
