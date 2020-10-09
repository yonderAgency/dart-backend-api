module.exports = async function bookings(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = req.param('providerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var bookings = await Booking.find({
            provider_id: userId
        });
        if (bookings) {
            json = [];
            for (x in bookings) {
                json.push(await Booking.getProviderJson(bookings[x], true));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.json(response);
        } else {
            response.message = sails.__('No booking found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
