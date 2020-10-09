module.exports = async function fetch(req, res) {
    var response = { status: 'NOK', message: '', data: [], model: [] };
    try {
        let settings = await Settings.getJson(sails.config.dynamics);
        response.status = 'OK';
        response.data = settings;
        response.message = sails.__('Success');
        response.data.location = req.location;
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
