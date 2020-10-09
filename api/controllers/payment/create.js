// let stripe = require('stripe')(sails.config.dynamics.STRIPE_SECRET);
const dimeApiKey = sails.config.dynamics.DIME_KEY;
const axios = require('axios');
const { config } = require('chai');

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedUser = req.authUser;
    const bookingToken = req.param('bookingToken');
    // const stripeToken = req.param('stripeToken');
    // const cardId = req.param('cardId');
    const cardNumber = req.param('number');
    const cardExpiry = req.param('expiry');
    const cardCvc = req.param('cvc');
    const customer_id = req.authUser.id;

    if (typeof bookingToken == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let booking = await Booking.find({
            token: bookingToken,
        }).limit(1);
        if (booking && booking.length > 0) {
            if (customer_id == booking[0].created_by) {
                let customer = await User.find({
                    id: booking[0].created_by,
                }).limit(1);
                let provider = await User.find({
                    id: booking[0].provider_id,
                }).limit(1);
                let providerProfile = await ProviderProfile.find({
                    created_by: booking[0].provider_id,
                }).limit(1);
                let bookingAddress = await UserAddress.find({
                    id: booking[0].customer_address_id,
                }).limit(1);
                let totalTime = booking[0].total_time;
                if (totalTime == '') {
                    if (booking[0].start_time && booking[0].last_start_time) {
                        const end_time = moment.utc().valueOf();
                        totalTime =
                            (parseInt(end_time) -
                                parseInt(booking[0].start_time)) /
                            1000;
                    }
                } else {
                    let goneTime = 0;
                    if (
                        booking[0].status ==
                            sails.config.constants.BOOKING_STATUS_STARTED &&
                        booking[0].last_start_time
                    ) {
                        const end_time = moment.utc().valueOf();
                        goneTime =
                            parseInt(end_time) -
                            parseInt(booking[0].last_start_time);
                    }
                    totalTime =
                        (parseInt(totalTime) + parseInt(goneTime)) / 1000;
                }
                let bookingItems = await BookingItem.find({
                    booking_id: booking[0].id,
                }).limit(1);
                let generatedAmount = 0;
                if (bookingItems[0]) {
                    generatedAmount = await Cart.getAmountForBooking(
                        bookingItems[0].package_id,
                        booking[0].id,
                        loggedUser.id,
                        booking[0].promo_code,
                        booking[0].delivery_type
                    );
                }
                await Booking.update({
                    id: booking[0].id,
                }).set({
                    total_amount: generatedAmount,
                });
                const paymentPacket = {
                    type: 'sale',
                    amount: generatedAmount * 100,
                    tax_amount: 0,
                    tax_exempt: true,
                    shipping_amount: 0,
                    currency: sails.config.dynamics.CURRENCY,
                    description:
                        booking[0].token +
                        ' Transaction for Order on ' +
                        sails.config.dynamics.APPLICATION_NAME,
                    order_id: booking[0].token,
                    po_number: booking[0].token,
                    ip_address: Api.filterIp(req.ip + ''),
                    email_receipt: true,
                    processor_id: "",
                    email_address: bookingAddress[0].email,
                    create_vault_record: false,
                    payment_method: {
                        card: {
                            entry_type: 'keyed',
                            number: cardNumber.replace(/\s/g,''),
                            expiration_date: cardExpiry,
                            cvc: cardCvc,
                        },
                    },
                    billing_address: {
                        first_name: bookingAddress[0].name,
                        last_name: '',
                        company: '',
                        address_line_1: bookingAddress[0].address_line1,
                        city: bookingAddress[0].city,
                        state: bookingAddress[0].state.substring(0,2),
                        postal_code: bookingAddress[0].zipcode,
                        country: sails.config.dynamics.DEFAULT_COUNTRY,
                        phone: bookingAddress[0].phone,
                        fax: '',
                        email: bookingAddress[0].email,
                    },
                    shipping_address: {
                        first_name: bookingAddress[0].name,
                        last_name: '',
                        company: '',
                        address_line_1: bookingAddress[0].address_line1,
                        city: bookingAddress[0].city,
                        state: bookingAddress[0].state.substring(0,2),
                        postal_code: bookingAddress[0].zipcode,
                        country: sails.config.dynamics.DEFAULT_COUNTRY,
                        phone: bookingAddress[0].phone,
                        fax: '',
                        email: bookingAddress[0].email,
                    },
                };
                if (customer.length > 0 && provider.length > 0) {
                    if (
                        booking[0].status ==
                        sails.config.constants.BOOKING_STATUS_ENDED
                    ) {
                        let = await axios.post(
                            'https://sandbox.dimegateway.com/api/transaction',
                            paymentPacket,
                            {
                                headers: {
                                    Authorization: dimeApiKey,
                                },
                            }
                        );
                        console.log(response);
                        // if (err) {
                        //     response.message = err.message
                        //         ? err.message
                        //         : sails.__('Unable to complete payment');
                        //     sails.sentry.captureException(err);
                        //     await Transactions.create({
                        //         reference_id: booking[0].id,
                        //         payment_medium: booking[0].payment_type,
                        //         payment_medium_id: cardId,
                        //         transaction_id: err.id,
                        //         amount: generatedAmount ? generatedAmount : 0,
                        //         status:
                        //             sails.config.constants.TRANSACTION_FAILED,
                        //         from_id: booking[0].created_by,
                        //         from_role: sails.config.constants.ROLE_CUSTOMER,
                        //         to_id: booking[0].provider_id,
                        //         to_role: sails.config.constants.ROLE_PROVIDER,
                        //         split_details: await Transactions.splitCuts(
                        //             generatedAmount ? generatedAmount : 0,
                        //             providerProfile[0],
                        //             booking[0].delivery_assigned
                        //         ),
                        //         ipAddress: User.pushIpData(
                        //             Api.filterIp(req.ip),
                        //             null,
                        //             req.options.action
                        //         ),
                        //     });
                        //     await Booking.update({
                        //         token: bookingToken,
                        //     }).set({
                        //         payment_status:
                        //             sails.config.constants.PAYMENT_FAILED,
                        //     });
                        //     return res.send(response);
                        // } else {
                        //     await Transactions.create({
                        //         reference_id: booking[0].id,
                        //         payment_medium: booking[0].payment_type,
                        //         payment_medium_id: cardId,
                        //         transaction_id: charge.id,
                        //         amount: generatedAmount ? generatedAmount : 0,
                        //         status:
                        //             sails.config.constants.TRANSACTION_SUCCESS,
                        //         from_id: booking[0].created_by,
                        //         from_role: sails.config.constants.ROLE_CUSTOMER,
                        //         to_id: booking[0].provider_id,
                        //         to_role: sails.config.constants.ROLE_PROVIDER,
                        //         split_details: await Transactions.splitCuts(
                        //             generatedAmount ? generatedAmount : 0,
                        //             providerProfile[0],
                        //             booking[0].delivery_assigned
                        //         ),
                        //         ipAddress: User.pushIpData(
                        //             Api.filterIp(req.ip),
                        //             null,
                        //             req.options.action
                        //         ),
                        //     });
                        //     await Booking.update({
                        //         token: bookingToken,
                        //     }).set({
                        //         payment_status:
                        //             sails.config.constants.PAYMENT_SUCCESS,
                        //         status:
                        //             sails.config.constants
                        //                 .BOOKING_STATUS_COMPLETED,
                        //         customer_approved: true,
                        //         provider_approved: true,
                        //     });
                        //     await sails.helpers.notification.with({
                        //         user_id: booking[0].provider_id,
                        //         type: 'BOOKING_COMPLETED_PROVIDER',
                        //         variables: '',
                        //         dataPacket: {
                        //             params: {
                        //                 bookingDetail: {
                        //                     key: booking[0].id,
                        //                 },
                        //                 showAlert: false,
                        //             },
                        //             type: sails.config.constants.RELOAD_BOOKING,
                        //             route:
                        //                 sails.config.constants
                        //                     .ROUTE_BOOKING_DETAIL,
                        //         },
                        //         reference_type:
                        //             sails.config.constants.NOTIFICATIONS
                        //                 .NEW_BOOKING_REQUEST,
                        //         status:
                        //             sails.config.constants
                        //                 .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                        //         reference_id: booking[0].id,
                        //     });
                        //     await sails.helpers.notification.with({
                        //         user_id: booking[0].created_by,
                        //         type: 'BOOKING_COMPLETED_CUSTOMER',
                        //         variables: '',
                        //         dataPacket: {
                        //             params: {
                        //                 bookingDetail: {
                        //                     key: booking[0].id,
                        //                 },
                        //                 showAlert: false,
                        //             },
                        //             type: sails.config.constants.RELOAD_BOOKING,
                        //             route:
                        //                 sails.config.constants
                        //                     .ROUTE_BOOKING_DETAIL,
                        //         },
                        //         reference_type:
                        //             sails.config.constants.NOTIFICATIONS
                        //                 .NEW_BOOKING_REQUEST,
                        //         status:
                        //             sails.config.constants
                        //                 .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                        //         reference_id: booking[0].id,
                        //     });
                        //     const createdBooking = await Booking.find({
                        //         token: bookingToken,
                        //     }).limit(1);
                        //     let finalData = await Booking.getJson(
                        //         createdBooking[0],
                        //         true
                        //     );
                        //     response.status = 'OK';
                        //     response.data = finalData;
                        //     response.message = sails.__(
                        //         'Booking completed successfully'
                        //     );
                        //     return res.send(response);
                        // }
                    } else {
                        let = await axios.post(
                            'https://sandbox.dimegateway.com/api/transaction',
                            paymentPacket,
                            {
                                headers: {
                                    Authorization: dimeApiKey,
                                },
                            }
                        );
                        console.log(response);
                        // stripe.charges.create(
                        //     {
                        //         amount: generatedAmount * 100,
                        //         currency: sails.config.dynamics.CURRENCY,
                        //         source: stripeToken,
                        //     },
                        //     async function (err, charge) {
                        //         if (err) {
                        //             response.message = err.message
                        //                 ? err.message
                        //                 : sails.__(
                        //                       'Unable to complete the payment'
                        //                   );
                        //             sails.sentry.captureException(err);
                        //             await Transactions.create({
                        //                 reference_id: booking[0].id,
                        //                 payment_medium: booking[0].payment_type,
                        //                 payment_medium_id: cardId,
                        //                 transaction_id: err.id,
                        //                 amount: generatedAmount
                        //                     ? generatedAmount
                        //                     : 0,
                        //                 status:
                        //                     sails.config.constants
                        //                         .TRANSACTION_FAILED,
                        //                 from_id: booking[0].created_by,
                        //                 from_role:
                        //                     sails.config.constants
                        //                         .ROLE_CUSTOMER,
                        //                 to_id: booking[0].provider_id,
                        //                 to_role:
                        //                     sails.config.constants
                        //                         .ROLE_PROVIDER,
                        //                 split_details: await Transactions.splitCuts(
                        //                     generatedAmount
                        //                         ? generatedAmount
                        //                         : 0,
                        //                     providerProfile[0],
                        //                     booking[0].delivery_assigned
                        //                 ),
                        //                 ipAddress: User.pushIpData(
                        //                     Api.filterIp(req.ip),
                        //                     null,
                        //                     req.options.action
                        //                 ),
                        //             });
                        //             await Booking.update({
                        //                 token: bookingToken,
                        //             }).set({
                        //                 payment_status:
                        //                     sails.config.constants
                        //                         .PAYMENT_FAILED,
                        //             });
                        //             return res.send(response);
                        //         } else {
                        //             await Transactions.create({
                        //                 reference_id: booking[0].id,
                        //                 payment_medium: booking[0].payment_type,
                        //                 payment_medium_id: cardId,
                        //                 transaction_id: charge.id,
                        //                 amount: generatedAmount
                        //                     ? generatedAmount
                        //                     : 0,
                        //                 status:
                        //                     sails.config.constants
                        //                         .TRANSACTION_SUCCESS,
                        //                 from_id: booking[0].created_by,
                        //                 from_role:
                        //                     sails.config.constants
                        //                         .ROLE_CUSTOMER,
                        //                 to_id: booking[0].provider_id,
                        //                 to_role:
                        //                     sails.config.constants
                        //                         .ROLE_PROVIDER,
                        //                 split_details: await Transactions.splitCuts(
                        //                     generatedAmount
                        //                         ? generatedAmount
                        //                         : 0,
                        //                     providerProfile[0],
                        //                     booking[0].delivery_assigned
                        //                 ),
                        //                 ipAddress: User.pushIpData(
                        //                     Api.filterIp(req.ip),
                        //                     null,
                        //                     req.options.action
                        //                 ),
                        //             });
                        //             await Booking.update({
                        //                 token: bookingToken,
                        //             }).set({
                        //                 payment_status:
                        //                     sails.config.constants
                        //                         .PAYMENT_SUCCESS,
                        //                 status:
                        //                     sails.config.constants
                        //                         .BOOKING_STATUS_INITIATED,
                        //                 customer_approved: true,
                        //             });
                        //             await sails.helpers.notification.with({
                        //                 user_id: booking[0].provider_id,
                        //                 type: 'NEW_BOOKING_REQUEST',
                        //                 variables: customer[0].name,
                        //                 dataPacket: {
                        //                     params: {
                        //                         bookingDetail: {
                        //                             key: booking[0].id,
                        //                         },
                        //                         showAlert: false,
                        //                     },
                        //                     type:
                        //                         sails.config.constants
                        //                             .RELOAD_BOOKING,
                        //                     route:
                        //                         sails.config.constants
                        //                             .ROUTE_BOOKING_DETAIL,
                        //                 },
                        //                 reference_type:
                        //                     sails.config.constants.NOTIFICATIONS
                        //                         .NEW_BOOKING_REQUEST,
                        //                 status:
                        //                     sails.config.constants
                        //                         .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                        //                 reference_id: booking[0].id,
                        //             });
                        //             const createdBooking = await Booking.find({
                        //                 token: bookingToken,
                        //             }).limit(1);
                        //             let finalData = await Booking.getJson(
                        //                 createdBooking[0],
                        //                 true
                        //             );
                        //             response.status = 'OK';
                        //             response.data = finalData;
                        //             response.message = sails.__(
                        //                 'Booking completed successfully'
                        //             );
                        //             return res.send(response);
                        //         }
                        //     }
                        // );
                    }
                }
            } else {
                response.message = sails.__('Invalid booking request');
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid card');
            return res.send(response);
        }
    } catch (err) {
        console.log({ data: err.response.data });
        let message = '';
        if (
            err.response &&
            err.response.data &&
            err.response.data.msg &&
            err.response.data.msg.length > 0
        ) {
            message = err.response.data.msg;
        }
        if (message === '' || message.length === 0) {
            if (err && err.message && err.message.length > 0) {
                message = err.message;
            }
        }
        sails.sentry.captureException(err);
        response.message =
            message && message.length > 0
                ? message
                : sails.__(
                      'We are very sorry, it is taking more than expected time. Please try again!'
                  );
        return res.send(response);
    }
};
