let axios = require('axios');
let moment = require('moment');
const https = require('https');
const hitDeliveryRequests = async (url, booking) => {
    try {
        let customerAddress = await UserAddress.getDeliveryAddress(
            booking.customer_address_id
        );
        let providerAddress = await UserAddress.getDeliveryAddress(
            booking.provider_address_id
        );
        if (customerAddress && providerAddress) {
            let delivery_cost = await Cart.getDeliveryAmount(booking);
            let axiosReturn = await axios({
                method: 'post',
                url: url,
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                }),
                data: {
                    bookingId: booking.id,
                    token: booking.token,
                    customerAddress: customerAddress,
                    providerAddress: providerAddress,
                    datetime: moment(booking.created_at).format(),
                    delivery_cost: delivery_cost
                }
            });
            return {
                status: 'OK',
                message: sails.__('Success'),
                data: axiosReturn
            };
        }
        return {
            status: 'NOK',
            message: sails.__('Unable to fetch addresses')
        };
    } catch (err) {
        return {
            status: 'NOK',
            message: sails.__('Unable to send requests')
        };
    }
};

module.exports = async function accept(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var userId = req.authUser.id;
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
            if (booking && booking.length > 0) {
                if (
                    booking[0].status ==
                    sails.config.constants.BOOKING_STATUS_INITIATED
                ) {
                    if (
                        booking[0].delivery_type ==
                        sails.config.constants.DELIVERY_TYPE_DELIVERY
                    ) {
                        const url =
                            sails.config.constants.DELIVERY_URL +
                            'v2/api/parenthandler/hitrequest';
                        let axiosResponse = await hitDeliveryRequests(
                            url,
                            booking[0]
                        );
                        
                        if (
                            axiosResponse.data &&
                            axiosResponse.data.data.statusCode == 200
                        ) {
                            await Booking.update({
                                token: bookingToken,
                                provider_id: userId
                            }).set({
                                status:
                                    sails.config.constants
                                        .BOOKING_STATUS_CONFIRMED,
                                updated_at: moment().valueOf()
                            });
                            var providerProfile = await ProviderProfile.find({
                                created_by: booking[0].provider_id
                            }).limit('1');
                            await Inbox.createAccepted(booking[0]);
                            await sails.helpers.notification.with({
                                user_id: booking[0].created_by,
                                type: 'BOOKING_ACCEPTED',
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
                                        sails.config.constants
                                            .ROUTE_BOOKING_DETAIL
                                },
                                reference_type:
                                    sails.config.constants.NOTIFICATIONS
                                        .BOOKING_ACCEPTED,
                                status:
                                    sails.config.constants
                                        .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                                reference_id: booking[0].id
                            });
                            var updatedbooking = await Booking.find({
                                token: bookingToken,
                                provider_id: userId
                            }).limit(1);
                            response.status = 'OK';
                            response.data = await Booking.getListJson(
                                updatedbooking[0]
                            );
                            response.message = sails.__(
                                'Booking accepted successfully'
                            );
                            return res.json(response);
                        } else {
                            response.data = await Booking.getListJson(
                                booking[0]
                            );
                            response.message = sails.__(
                                'Unable to send delivery request, please try again!'
                            );
                            return res.json(response);
                        }
                    } else {
                        await Booking.update({
                            token: bookingToken,
                            provider_id: userId
                        }).set({
                            status:
                                sails.config.constants.BOOKING_STATUS_CONFIRMED,
                            updated_at: moment().valueOf()
                        });
                        var providerProfile = await ProviderProfile.find({
                            created_by: booking[0].provider_id
                        }).limit('1');
                        await Inbox.createAccepted(booking[0]);
                        await sails.helpers.notification.with({
                            user_id: booking[0].created_by,
                            type: 'BOOKING_ACCEPTED',
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
                                    .BOOKING_ACCEPTED,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id
                        });
                        var updatedbooking = await Booking.find({
                            token: bookingToken,
                            provider_id: userId
                        }).limit(1);
                        response.status = 'OK';
                        response.data = await Booking.getListJson(
                            updatedbooking[0]
                        );
                        response.message = sails.__(
                            'Booking accepted successfully'
                        );
                        return res.json(response);
                    }
                } else if (
                    booking[0].status ==
                    sails.config.constants.BOOKING_STATUS_CONFIRMED
                ) {
                    response.message = sails.__('Booking already accepted');
                    return res.send(response);
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
