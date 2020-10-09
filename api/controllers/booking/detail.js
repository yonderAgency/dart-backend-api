module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const bookingId = req.param('bookingId');
    const userId = req.authUser.id;

    if (typeof bookingId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var booking = await Booking.find({
            id: bookingId,
        }).limit(1);
        if (booking.length > 0) {
            const detail = await Booking.getJson(booking[0], true);
            await Notifications.update({
                reference_id: booking[0].id,
                created_by: userId,
                is_read: sails.config.constants.READ_FALSE,
            }).set({
                is_read: sails.config.constants.READ_TRUE,
            });
            response.message = sails.__('Success');
            response.status = 'OK';
            response.data = detail;
            return res.json(response);
        } else {
            response.message = sails.__('No booking found');
            return res.json(response);
        }
    } catch (err) {
        console.log({ err });
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
