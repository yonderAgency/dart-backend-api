module.exports = async function reject(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const userId = req.authUser.id;
    const bookingToken = req.param('bookingToken');
    const reason = req.param('reason');

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
            if (booking && booking.length > 0) {
                if (
                    booking[0].status ==
                    sails.config.constants.BOOKING_STATUS_INITIATED
                ) {
                    await Booking.update({
                        token: bookingToken,
                        provider_id: userId
                    }).set({
                        reject_reason: reason,
                        status: sails.config.constants.BOOKING_STATUS_REJECTED
                    });
                    var providerProfile = await ProviderProfile.find({
                        created_by: booking[0].provider_id
                    }).limit('1');
                    await sails.helpers.notification.with({
                        user_id: booking[0].created_by,
                        type: 'BOOKING_REJECTED',
                        variables: providerProfile[0].business_name,
                        dataPacket: {
                            params: {
                                bookingDetail: {
                                    key: booking[0].id
                                },
                                showAlert: false
                            },
                            type: sails.config.constants.RELOAD_BOOKING,
                            route: sails.config.constants.ROUTE_BOOKING_DETAIL
                        },
                        reference_type:
                            sails.config.constants.NOTIFICATIONS
                                .BOOKING_REJECTED,
                        status:
                            sails.config.constants
                                .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                        reference_id: booking[0].id
                    });
                    response.status = 'OK';
                    var updatedbooking = await Booking.find({
                        token: bookingToken,
                        provider_id: userId
                    }).limit(1);
                    response.data = await Booking.getListJson(
                        updatedbooking[0]
                    );
                    response.message = sails.__(
                        'Booking rejected successfully'
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
