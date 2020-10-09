module.exports = async function addresses(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = req.param('providerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var hours = await ProviderBusinessHours.find({
            created_by: userId
        });
        if (hours && hours.length > 0) {
            for (x in hours) {
                response.data = await ProviderBusinessHours.getJson(
                    hours[x],
                    true
                );
                response.status = 'OK';
                response.message = sails.__('Success');
                return res.json(response);
            }
        } else {
            response.message = sails.__('No timings found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
