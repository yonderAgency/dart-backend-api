module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        var settings = await AdminSettings.find().limit(1);
        if (settings.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await AdminSettings.getJson(settings[0]);
            return res.send(response);
        } else {
            response.message = sails.__('Settings not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
