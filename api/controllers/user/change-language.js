module.exports = async function changeLanguage(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const lang = req.param('language');
    var user_id = req.authUser.id;

    if (typeof lang == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        response.message = sails.__('Language changed successfully');
        await User.update({ id: user_id }).set({
            language: lang,
            ipAddress: User.pushIpData(
                Api.filterIp(req.ip),
                req.authUser.ipAddress,
                req.options.action
            )
        });
        response.status = 'OK';
        res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
