module.exports = async function gettoggle(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const bookingId = req.param('bookingId');
    const userId = req.authUser.id;

    if (typeof bookingId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var booking = await Booking.find({
            id: bookingId
        }).limit(1);
        if (booking.length > 0) {
            response.message = sails.__('Success');
            response.status = 'OK';
            response.data = booking[0].hide_address;
            return res.json(response);
        } else {
            response.message = sails.__('No booking found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
