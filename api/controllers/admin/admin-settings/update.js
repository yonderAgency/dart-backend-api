const api = require('../../../models/Api.js');

module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const userId = req.authUser.id;
    try {
        var settings = await AdminSettings.find({}).limit(1);
        if (settings.length > 0) {
            var set = {
                main_color: api.checkIncomingAttribute(
                    req.param('mainColor'),
                    settings[0].main_color
                ),
                navbar_type: api.checkIncomingAttribute(
                    req.param('navBarType'),
                    settings[0].navbar_type
                ),
                is_dark: api.checkIncomingAttribute(
                    req.param('isDark'),
                    settings[0].is_dark
                ),
                updated_by: userId
            };
            await AdminSettings.update({ id: settings[0].id }).set(set);
            response.message = sails.__('Settings updated successfully');
            response.status = 'OK';
            return res.send(response);
        } else {
            var set = {
                main_color: req.param('mainColor'),
                navbar_type: req.param('navBarType'),
                is_dark: req.param('isDark'),
                updated_by: userId,
                created_by: userId,
                created_at: moment().valueOf()
            };
            await AdminSettings.create(set);
            response.message = sails.__('Settings updated successfully');
            response.status = 'OK';
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
