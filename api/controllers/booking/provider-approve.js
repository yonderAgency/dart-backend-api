const api = require('../../models/Api.js');

module.exports = async function providerApprove(req, res) {
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
                        sails.config.constants.BOOKING_STATUS_ENDED,
                        sails.config.constants.BOOKING_STATUS_COMPLETED
                    ].indexOf(booking[0].status) != -1
                ) {
                    if (
                        booking[0].payment_type ==
                        sails.config.constants.BOOKING_TYPE_CASH
                    ) {
                        await Booking.update({
                            token: bookingToken,
                            provider_id: userId
                        }).set({
                            status:
                                sails.config.constants.BOOKING_STATUS_COMPLETED,
                            provider_approved: true,
                            customer_approved: true,
                            payment_status:
                                sails.config.constants.PAYMENT_SUCCESS,
                            payment_type:
                                sails.config.constants.BOOKING_TYPE_CASH
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
                                    .BOOKING_COMPLETED_CUSTOMER,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id
                        });
                        await Booking.updateDueAmount({
                            total_amount: booking[0].total_amount,
                            provider_id: booking[0].provider_id,
                            payment_type: sails.config.constants.BOOKING_TYPE_CASH
                        });
                    } else if (
                        booking.payment_type ==
                        sails.config.constants.BOOKING_TYPE_CARD
                    ) {
                        await Booking.update({
                            token: bookingToken,
                            provider_id: userId
                        }).set({
                            status:
                                sails.config.constants.BOOKING_STATUS_COMPLETED,
                            provider_approved: true,
                            customer_approved: true,
                            payment_status:
                                sails.config.constants.PAYMENT_SUCCESS
                        });
                    } else {
                        await Booking.update({
                            token: bookingToken,
                            provider_id: userId
                        }).set({
                            status:
                                sails.config.constants.BOOKING_STATUS_COMPLETED,
                            provider_approved: true,
                            customer_approved: true,
                            payment_status:
                                sails.config.constants.PAYMENT_SUCCESS,
                            payment_type:
                                sails.config.constants.BOOKING_TYPE_CASH
                        });
                    }
                    response.status = 'OK';
                    response.message = sails.__(
                        'Booking amount approved successfully'
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
