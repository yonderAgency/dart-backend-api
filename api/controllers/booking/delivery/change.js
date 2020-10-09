const moment = require('moment');
module.exports = async function change(req, res) {
    var response = {
        status: 'NOK',
        message: '',
        data: {},
    };

    const userId = req.param('userId');
    const job_status = req.param('job_status');
    const token = req.param('token');
    const user = req.param('user');
    if (
        typeof userId == 'undefined' ||
        req.headers['x-auth-token'] != sails.config.constants.DELIVERY_KEY ||
        typeof job_status == 'undefined' ||
        typeof token == 'undefined'
    ) {
        response.status = 'NOK';
        response.message = sails.__('Invalid data');
        response.data.bookingList = [];

        return res.send(response);
    }
    console.log({ userId });
    console.log({ job_status });
    try {
        let booking = await Booking.find({
            token: token,
        }).limit(1);
        console.log({ booking });
        if (booking && booking.length > 0) {
            if (
                job_status == 'CONFIRMED' &&
                booking[0].delivery_type ==
                    sails.config.constants.DELIVERY_TYPE_DELIVERY &&
                booking[0].status ==
                    sails.config.constants.BOOKING_STATUS_CONFIRMED &&
                (typeof booking[0].assigned_to == 'undefined' ||
                    booking[0].assigned_to == 'undefined' ||
                    booking[0].assigned_to === '')
            ) {
                await Booking.update({
                    token: token,
                }).set({
                    assigned_to: userId,
                    delivery_details: user,
                    start_time: moment().valueOf(),
                });
                booking = await Booking.find({
                    token: token,
                    assigned_to: userId,
                }).limit(1);

                await sails.helpers.notification.with({
                    user_id: booking[0].created_by,
                    type: 'DELIVERY_ACCEPTED',
                    variables: user.name,
                    dataPacket: {
                        params: {
                            bookingDetail: {
                                key: booking[0].id,
                            },
                            showAlert: false,
                        },
                        type: sails.config.constants.RELOAD_BOOKING,
                        route: sails.config.constants.ROUTE_BOOKING_DETAIL,
                    },
                    reference_type:
                        sails.config.constants.NOTIFICATIONS.DELIVERY_ACCEPTED,
                    status:
                        sails.config.constants
                            .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                    reference_id: booking[0].id,
                });
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = await Booking.getCompleteDeliveryPacket(
                    booking[0]
                );

                return res.send(response);
            } else if (
                job_status == 'DISPATCHED' &&
                booking[0].delivery_type ==
                    sails.config.constants.DELIVERY_TYPE_DELIVERY &&
                booking[0].assigned_to != '' &&
                booking[0].status ==
                    sails.config.constants.BOOKING_STATUS_CONFIRMED
            ) {
                await Booking.update({
                    token: token,
                }).set({
                    assigned_to: userId,
                    delivery_details: user,
                    status: sails.config.constants.BOOKING_STATUS_STARTED,
                });
                booking = await Booking.find({
                    token: token,
                    assigned_to: userId,
                }).limit(1);
                await sails.helpers.notification.with({
                    user_id: booking[0].created_by,
                    type: 'BOOKING_STARTED',
                    variables: user.name,
                    dataPacket: {
                        params: {
                            bookingDetail: {
                                key: booking[0].id,
                            },
                            showAlert: false,
                        },
                        type: sails.config.constants.RELOAD_BOOKING,
                        route: sails.config.constants.ROUTE_BOOKING_DETAIL,
                    },
                    reference_type:
                        sails.config.constants.NOTIFICATIONS.BOOKING_STARTED,
                    status:
                        sails.config.constants
                            .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                    reference_id: booking[0].id,
                });
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = await Booking.getCompleteDeliveryPacket(
                    booking[0]
                );
                return res.send(response);
            } else if (
                job_status == 'COMPLETED' &&
                booking[0].delivery_type ==
                    sails.config.constants.DELIVERY_TYPE_DELIVERY &&
                booking[0].assigned_to != '' &&
                booking[0].status ==
                    sails.config.constants.BOOKING_STATUS_STARTED
            ) {
                await Booking.update({
                    token: token,
                }).set({
                    assigned_to: userId,
                    delivery_details: user,
                    status: sails.config.constants.BOOKING_STATUS_COMPLETED,
                    payment_status: sails.config.constants.PAYMENT_SUCCESS,
                    end_time: moment().valueOf(),
                });
                booking = await Booking.find({
                    token: token,
                    assigned_to: userId,
                }).limit(1);
                await Booking.updateDueAmount({
                    total_amount: booking[0].total_amount,
                    provider_id: booking[0].provider_id,
                    payment_type: booking[0].payment_type,
                    delivery_type: booking[0].delivery_type,
                    driverId: booking[0].assigned_to,
                    delivery_cost: booking[0].delivery_cost,
                    delivery_tip: booking[0].delivery_tip,
                    adminCut: booking[0].adminCut,
                });
                await sails.helpers.notification.with({
                    user_id: booking[0].created_by,
                    type: 'BOOKING_ENDED',
                    variables: user.name,
                    dataPacket: {
                        params: {
                            bookingDetail: {
                                key: booking[0].id,
                            },
                            showAlert: false,
                        },
                        type: sails.config.constants.RELOAD_BOOKING,
                        route: sails.config.constants.ROUTE_BOOKING_DETAIL,
                    },
                    reference_type:
                        sails.config.constants.NOTIFICATIONS.BOOKING_ENDED,
                    status:
                        sails.config.constants
                            .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                    reference_id: booking[0].id,
                });
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = await Booking.getCompleteDeliveryPacket(
                    booking[0]
                );

                return res.send(response);
            } else if (
                booking[0].delivery_type ==
                    sails.config.constants.DELIVERY_TYPE_DELIVERY &&
                booking[0].assigned_to != userId
            ) {
                response.status = 'NOK';
                response.message = sails.__('Booking already accepted');
                return res.send(response);
            } else if (job_status == 'REJECTED') {
                response.status = 'OK';
                response.data = await Booking.getCompleteDeliveryPacket(
                    booking[0]
                );
                response.message = sails.__('Success');
                return res.send(response);
            } else {
                response.status = 'NOK';
                response.message = sails.__('Invalid request');
                return res.send(response);
            }
        } else {
            response.status = 'OK';
            response.message = sails.__('Booking not found');
            return res.send(response);
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
