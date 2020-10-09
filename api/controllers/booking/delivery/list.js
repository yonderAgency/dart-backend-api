module.exports = async function list(req, res) {
    var response = {
        status: 'NOK',
        message: '',
        data: {}
    };

    let limit = req.param('limit');
    if (typeof limit == 'undefined') {
        limit = 25;
    }
    let page = req.param('page');
    if (typeof page == 'undefined' || page == 0) {
        page = 1;
    }

    if (
        typeof req.param('userId') == 'undefined' ||
        req.headers['x-auth-token'] != sails.config.constants.DELIVERY_KEY
    ) {
        response.status = 'NOK';
        response.message = sails.__('Invalid data');
        response.data = [];
        return res.send(response);
    }

    const userId = req.param('userId');

    try {
        const bookingList = [];
        let bookings = await Booking.find({
            assigned_to: userId
        })
            .limit(limit)
            .skip(limit * (page - 1))
            .sort('created_at DESC');
        if (bookings.length > 0) {
            for (x in bookings) {
                bookingList.push(
                    await Booking.getSmallDeliveryPacket(bookings[x])
                );
            }
            if (bookingList.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = bookingList;
                return res.send(response);
            } else {
                response.status = 'OK';
                response.message = sails.__('No booking found');
                response.data = [];
                return res.send(response);
            }
        } else {
            response.status = 'OK';
            response.message = sails.__('No booking found');
            response.data = [];
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
