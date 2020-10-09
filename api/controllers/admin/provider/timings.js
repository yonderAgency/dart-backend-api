module.exports = async function timings(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = req.param('providerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var businessHours = await ProviderBusinessHours.find({
            created_by: userId
        }).limit(1);
        if (businessHours && businessHours.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await ProviderBusinessHours.getJson(
                businessHours[x],
                true
            );
            return res.json(response);
        } else {
            response.message = sails.__('No address found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
