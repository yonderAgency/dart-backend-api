module.exports = async function detail(req, res) {
    var response = {
        status: 'NOK',
        message: '',
        data: {}
    };

    const userId = req.param('userId');
    const token = req.param('token');

    if (
        typeof userId == 'undefined' ||
        req.headers['x-auth-token'] != sails.config.constants.DELIVERY_KEY ||
        typeof token == 'undefined'
    ) {
        response.status = 'NOK';
        response.message = sails.__('Invalid data');
        return res.send(response);
    }

    try {
        let booking = await Booking.find({
            token: token
        }).limit(1);
        if (booking.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Booking.getCompleteDeliveryPacket(booking[0]);
            return res.send(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('Booking not found');
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
