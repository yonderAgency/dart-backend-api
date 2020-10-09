const api = require('../../../models/Api');

module.exports = async function updateHelpdesk(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        var settings = await Settings.find({
            status: sails.config.constants.STATUS_ACTIVE
        }).limit(1);
        if (settings.length > 0) {
            const helpdesk = api.checkIncomingAttribute(
                req.param('helpdesk'),
                settings[0].HELPDESK_MESSAGES
            );
            await Settings.update({
                status: sails.config.constants.STATUS_ACTIVE
            }).set({
                HELPDESK_MESSAGES: helpdesk
            });
            response.status = 'OK';
            response.message = sails.__(
                'Helpdesk messages updated successfully, changes will be reflected on app restart'
            );
            const loadedSettings = await Settings.find({
                status: sails.config.constants.STATUS_ACTIVE
            }).limit(1);
            if (loadedSettings.length > 0) {
                sails.config.dynamics.HELPDESK_MESSAGES =
                    loadedSettings[0].HELPDESK_MESSAGES;
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
