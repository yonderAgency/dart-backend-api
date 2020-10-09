const api = require('../../../models/Api');

module.exports = async function updateColor(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    
    try {
        var settings = await Settings.find({
            status: sails.config.constants.STATUS_ACTIVE
        }).limit(1);
        if (settings.length > 0) {
            const colorScheme = api.checkIncomingAttribute(
                req.param('appColors'),
                settings[0].COLORS
            );
            await Settings.update({
                status: sails.config.constants.STATUS_ACTIVE
            }).set({
                COLORS: colorScheme
            });
            response.status = 'OK';
            response.message = sails.__(
                'Color settings updated successfully, changes will be reflected on app restart'
            );
            const loadedSettings = await Settings.find({
                status: sails.config.constants.STATUS_ACTIVE
            }).limit(1);
            if (loadedSettings.length > 0) {
                sails.config.dynamics = loadedSettings[0];
            }
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
