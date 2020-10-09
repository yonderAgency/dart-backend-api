module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const type = req.param('type');
    
    try {
        var settings = await Settings.find({
            status: sails.config.constants.STATUS_ACTIVE
        }).limit(1);
        if (settings.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Settings.getAdminJson(settings[0], type);
            return res.json(response);
        }
        response.message = sails.__('Settings not found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
