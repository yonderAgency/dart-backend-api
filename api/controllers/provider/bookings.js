const api = require('../../models/Api.js');

module.exports = async function bookings(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const userId = req.authUser.id;
    const type = req.param('type');
    let limit = req.param('limit');
    if (typeof limit == 'undefined') {
        limit = 10;
    }
    let page = req.param('page');
    if (typeof page == 'undefined') {
        page = 1;
    }

    try {
        const bookingList = [];
        var status = null;
        if (type && typeof type != 'undefined' && type != '') {
            if (type == sails.config.constants.PROVIDER_BOOKING_VIEW_NEW) {
                status = [sails.config.constants.BOOKING_STATUS_INITIATED];
            } else if (
                type == sails.config.constants.PROVIDER_BOOKING_VIEW_INPROGRESSS
            ) {
                status = [
                    sails.config.constants.BOOKING_STATUS_CONFIRMED,
                    sails.config.constants.BOOKING_STATUS_INPROGRESS,
                    sails.config.constants.BOOKING_STATUS_STARTED,
                    sails.config.constants.BOOKING_STATUS_PAUSED
                ];
            } else if (
                type == sails.config.constants.PROVIDER_BOOKING_VIEW_COMPLETED
            ) {
                status = [
                    sails.config.constants.BOOKING_STATUS_ENDED,
                    sails.config.constants.BOOKING_STATUS_COMPLETED
                ];
            } else if (
                type == sails.config.constants.PROVIDER_BOOKING_VIEW_CANCELLED
            ) {
                status = [
                    sails.config.constants.BOOKING_STATUS_REJECTED,
                    sails.config.constants.BOOKING_STATUS_CANCELLED
                ];
            } else {
                status = null;
            }
        }
        var bookings = [];
        if (status != null) {
            bookings = await Booking.find({
                provider_id: userId,
                status: {
                    '!=': sails.config.constants.BOOKING_STATUS_INCART
                },
                status: status
            })
                .limit(limit)
                .skip(limit * (page - 1))
                .sort('created_at DESC');
        } else {
            bookings = await Booking.find({
                provider_id: userId,
                status: {
                    '!=': sails.config.constants.BOOKING_STATUS_INCART
                }
            })
                .limit(limit)
                .skip(limit * (page - 1))
                .sort('created_at DESC');
        }
        if (bookings.length > 0) {
            for (x in bookings) {
                bookingList.push(await Booking.getListJson(bookings[x]));
            }
            if (bookingList.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data.bookingList = bookingList;
                response.data.page = page;
                return res.json(response);
            } else {
                response.status = 'OK';
                response.message = sails.__('No booking found');
                response.data.bookingList = [];
                response.data.page = page;
                return res.send(response);
            }
        } else {
            response.status = 'OK';
            response.message = sails.__('No booking found');
            response.data.bookingList = [];
            response.data.page = page;
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
