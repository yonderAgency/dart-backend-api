module.exports = async function timings(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var providerId = req.authUser.id;

    try {
        var businessHours = await ProviderBusinessHours.find({
            created_by: providerId
        }).limit(1);
        if (businessHours && businessHours.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await ProviderBusinessHours.getJson(
                businessHours[0],
                true
            );
            return res.json(response);
        } else {
            response.message = sails.__('No address found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
