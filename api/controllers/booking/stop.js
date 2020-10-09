const moment = require('moment');

module.exports = async function stop(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const userId = req.authUser.id;
    const bookingToken = req.param('bookingToken');

    if (typeof bookingToken == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (userId) {
            var booking = await Booking.find({
                token: bookingToken,
                provider_id: userId
            }).limit(1);
            if (booking.length > 0) {
                if (
                    [
                        sails.config.constants.BOOKING_STATUS_CONFIRMED,
                        sails.config.constants.BOOKING_STATUS_STARTED,
                        sails.config.constants.BOOKING_STATUS_PAUSED,
                        sails.config.constants.BOOKING_STATUS_ENDED
                    ].indexOf(booking[0].status != -1)
                ) {
                    const end_time = moment.utc().valueOf();
                    var start_time = booking[0].start_time
                        ? booking[0].start_time
                        : 0;
                    if (booking[0].last_start_time) {
                        start_time = booking[0].last_start_time
                            ? booking[0].last_start_time
                            : 0;
                    }
                    const total_time = booking[0].total_time
                        ? booking[0].total_time
                        : 0;
                    var setStatus = sails.config.constants.BOOKING_STATUS_ENDED;
                    var providerProfile = await ProviderProfile.find({
                        created_by: booking[0].provider_id
                    }).limit('1');
                    if (
                        booking[0].payment_status ==
                        sails.config.constants.PAYMENT_SUCCESS
                    ) {
                        setStatus =
                            sails.config.constants.BOOKING_STATUS_COMPLETED;
                        await sails.helpers.notification.with({
                            user_id: booking[0].provider_id,
                            type: 'BOOKING_COMPLETED_PROVIDER',
                            variables: '',
                            dataPacket: {
                                params: {
                                    bookingDetail: {
                                        key: booking[0].id
                                    },
                                    showAlert: false
                                },
                                type: sails.config.constants.RELOAD_BOOKING,
                                route:
                                    sails.config.constants.ROUTE_BOOKING_DETAIL
                            },
                            reference_type:
                                sails.config.constants.NOTIFICATIONS
                                    .BOOKING_ENDED,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id
                        });
                        await sails.helpers.notification.with({
                            user_id: booking[0].created_by,
                            type: 'BOOKING_COMPLETED_CUSTOMER',
                            variables: '',
                            dataPacket: {
                                params: {
                                    bookingDetail: {
                                        key: booking[0].id
                                    },
                                    showAlert: false
                                },
                                type: sails.config.constants.RELOAD_BOOKING,
                                route:
                                    sails.config.constants.ROUTE_BOOKING_DETAIL
                            },
                            reference_type:
                                sails.config.constants.NOTIFICATIONS
                                    .BOOKING_ENDED,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id
                        });
                    } else {
                        await sails.helpers.notification.with({
                            user_id: booking[0].created_by,
                            type: 'BOOKING_ENDED',
                            variables: providerProfile[0].business_name,
                            dataPacket: {
                                params: {
                                    bookingDetail: {
                                        key: booking[0].id
                                    },
                                    showAlert: false
                                },
                                type: sails.config.constants.RELOAD_BOOKING,
                                route:
                                    sails.config.constants.ROUTE_BOOKING_DETAIL
                            },
                            reference_type:
                                sails.config.constants.NOTIFICATIONS
                                    .BOOKING_ENDED,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id
                        });
                    }

                    await Booking.update({
                        token: bookingToken,
                        provider_id: userId
                    }).set({
                        status: setStatus,
                        end_time: moment.utc().valueOf(),
                        total_time:
                            parseInt(total_time) +
                            (parseInt(end_time) - parseInt(start_time))
                    });
                    response.status = 'OK';
                    response.message = sails.__('Booking ended successfully');
                    var updatedbooking = await Booking.find({
                        token: bookingToken,
                        provider_id: userId
                    }).limit(1);
                    response.data = await Booking.getListJson(
                        updatedbooking[0]
                    );
                    return res.json(response);
                } else {
                    response.message = sails.__('Invalid booking request');
                    return res.send(response);
                }
            } else {
                response.message = sails.__('Booking not found');
                return res.send(response);
            }
        } else {
            response.message = sails.__('User not found');
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
