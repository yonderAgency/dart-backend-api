module.exports = async function charges(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var providerId = req.param('providerId');

    if (typeof providerId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var bookings = await Booking.find({
            provider_id: providerId,
            payment_status: sails.config.constants.PAYMENT_SUCCESS,
            is_due_paid: false
        });
        if (bookings) {
            json = [];
            for (x in bookings) {
                json.push(await Booking.getTransactionJson(bookings[x]));
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
