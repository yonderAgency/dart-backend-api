module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var bookingToken = req.param('bookingToken');

    if (typeof bookingToken == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var bookings = await Booking.find({
            token: bookingToken
        }).limit(1);
        if (bookings.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Booking.getJson(bookings[0], true);
            return res.json(response);
        } else {
            response.message = sails.__('No booking found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
