const moment = require('moment');

module.exports = async function wallet(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const bookingToken = req.param('bookingToken');
    const customer_id = req.authUser.id;

    if (typeof bookingToken == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let booking = await Booking.find({
            token: bookingToken
        }).limit(1);
        if (booking.length > 0) {
            if (customer_id == booking[0].created_by) {
                let customer = await User.find({
                    id: booking[0].created_by
                }).limit(1);
                let provider = await User.find({
                    id: booking[0].provider_id
                }).limit(1);
                let providerProfile = await ProviderProfile.find({
                    created_by: booking[0].provider_id
                }).limit(1);
                if (customer.length > 0 && provider.length > 0) {
                    let totalTime = booking[0].total_time;
                    if (totalTime == '') {
                        if (
                            booking[0].start_time &&
                            booking[0].last_start_time
                        ) {
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
                    const amount = await Booking.getTotalAmount(
                        booking[0],
                        totalTime
                    );
                    await Booking.update({
                        id: booking[0].id
                    }).set({
                        total_amount: amount ? amount : 0
                    });
                    let wallet = await Wallet.find({
                        created_by: customer[0].id
                    }).limit(1);
                    if (wallet.length > 0) {
                        let remainingAmount =
                            parseFloat(wallet[0].balance) - parseFloat(amount);
                        if (remainingAmount >= 0) {
                            await WalletTransactions.create({
                                wallet_id: wallet[0].id,
                                heading: 'Paid by wallet',
                                amount: amount ? amount : 0,
                                closing_balance: remainingAmount,
                                user_id: booking[0].created_by,
                                status:
                                    sails.config.constants
                                        .WALLET_TRANSACTION_SUCCESS,
                                type: sails.config.constants.WALLET_DEDUCTION,
                                created_by: booking[0].created_by
                            });
                            let walletTransaction = await WalletTransactions.find(
                                {
                                    wallet_id: wallet[0].id,
                                    created_by: booking[0].created_by
                                }
                            )
                                .sort('created_at DESC')
                                .limit(1);
                            await Booking.updateDueAmount({
                                total_amount: booking[0].amount,
                                provider_id: booking[0].provider_id,
                                payment_type:
                                    sails.config.constants.BOOKING_TYPE_WALLET
                            });
                            await Wallet.update({
                                id: wallet[0].id
                            }).set({
                                balance: remainingAmount,
                                updated_at: await sails.helpers.timestamp.with({
                                    datetime: moment
                                        .utc()
                                        .format('YYYY-MM-DD HH:mm:ss')
                                })
                            });
                            await Transactions.create({
                                reference_id: booking[0].id,
                                payment_medium:
                                    sails.config.constants
                                        .TRANSACTION_REFERENCE_MEDIUM_WALLET,
                                payment_medium_id: wallet[0].id,
                                transaction_id: walletTransaction[0].id,
                                amount: amount ? amount : 0,
                                status:
                                    sails.config.constants.TRANSACTION_SUCCESS,
                                from_id: booking[0].created_by,
                                from_role: sails.config.constants.ROLE_CUSTOMER,
                                to_id: booking[0].provider_id,
                                to_role: sails.config.constants.ROLE_PROVIDER,
                                split_details: await Transactions.splitCuts(
                                    amount ? amount : 0,
                                    providerProfile[0],
                                    booking[0].delivery_assigned
                                ),
                                ipAddress: User.pushIpData(
                                    Api.filterIp(req.ip),
                                    null,
                                    req.options.action
                                )
                            });
                            if (
                                booking[0].status ==
                                sails.config.constants.BOOKING_STATUS_ENDED
                            ) {
                                await Booking.update({
                                    id: booking[0].id
                                }).set({
                                    payment_status:
                                        sails.config.constants.PAYMENT_SUCCESS,
                                    status:
                                        sails.config.constants
                                            .BOOKING_STATUS_COMPLETED,
                                    customer_approved: true,
                                    provider_approved: true
                                });
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
                                        type:
                                            sails.config.constants
                                                .RELOAD_BOOKING,
                                        route:
                                            sails.config.constants
                                                .ROUTE_BOOKING_DETAIL
                                    },
                                    reference_type:
                                        sails.config.constants.NOTIFICATIONS
                                            .BOOKING_COMPLETED_PROVIDER,
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
                                        type:
                                            sails.config.constants
                                                .RELOAD_BOOKING,
                                        route:
                                            sails.config.constants
                                                .ROUTE_BOOKING_DETAIL
                                    },
                                    reference_type:
                                        sails.config.constants.NOTIFICATIONS
                                            .BOOKING_COMPLETED_CUSTOMER,
                                    status:
                                        sails.config.constants
                                            .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                                    reference_id: booking[0].id
                                });
                                response.status = 'OK';
                                response.message = sails.__(
                                    'Booking completed successfully'
                                );
                                return res.json(response);
                            } else {
                                await Booking.update({
                                    id: booking[0].id
                                }).set({
                                    payment_status:
                                        sails.config.constants.PAYMENT_SUCCESS,
                                    status:
                                        sails.config.constants
                                            .BOOKING_STATUS_INITIATED,
                                    customer_approved: true
                                });
                                await sails.helpers.notification.with({
                                    user_id: booking[0].provider_id,
                                    type: 'NEW_BOOKING_REQUEST',
                                    variables: customer_id,
                                    dataPacket: {
                                        params: {
                                            bookingDetail: {
                                                key: booking[0].id
                                            },
                                            showAlert: false
                                        },
                                        type:
                                            sails.config.constants
                                                .RELOAD_BOOKING,
                                        route:
                                            sails.config.constants
                                                .ROUTE_BOOKING_DETAIL
                                    },
                                    reference_type:
                                        sails.config.constants.NOTIFICATIONS
                                            .NEW_BOOKING_REQUEST,
                                    status:
                                        sails.config.constants
                                            .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                                    reference_id: booking[0].id
                                });
                                response.status = 'OK';
                                response.message = sails.__(
                                    'Booking saved successfully'
                                );
                                return res.json(response);
                            }
                        } else {
                            response.message = sails.__(
                                'You have insufficient credits in your wallet'
                            );
                            return res.json(response);
                        }
                    } else {
                        response.message = sails.__(
                            'You have no credits in your wallet'
                        );
                        return res.json(response);
                    }
                } else {
                    response.message = sails.__('Invalid booking request');
                    return res.send(response);
                }
            } else {
                response.message = sails.__('Invalid booking request');
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid booking request');
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
