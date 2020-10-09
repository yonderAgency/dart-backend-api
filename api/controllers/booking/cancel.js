const path = require('path');
const moment = require('moment');

module.exports = async function cancel(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var provider = [];
    var providerProfile = [];
    var customer = [];

    const user = req.authUser;
    const bookingId = req.param('bookingId');

    if (typeof bookingId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var pathName = path.parse('/assets/images/website-logo.png');
    var logoImage =
        sails.config.constants.BASE_URL + pathName.dir + '/' + pathName.base;
    let websiteImages = await Api.getWebsiteImage();

    try {
        var booking = await Booking.find({
            id: bookingId
        }).limit(1);
        if (booking && booking.length > 0) {
            if (user.role == sails.config.constants.ROLE_PROVIDER) {
                providerProfile = await ProviderProfile.find({
                    created_by: booking[0].provider_id
                }).limit(1);
                provider = [user];
                customer = await User.find({
                    id: booking[0].created_by
                }).limit(1);
            } else {
                customer = [user];
                provider = await User.find({
                    id: booking[0].provider_id
                }).limit(1);
                providerProfile = await ProviderProfile.find({
                    created_by: booking[0].provider_id
                }).limit(1);
            }
            if (customer.length > 0 && provider.length > 0) {
                var checkingTime =
                    moment().valueOf() -
                    sails.config.dynamics.CANCELLATION_MINUTES;
                if (
                    booking[0].status ==
                        sails.config.constants.BOOKING_STATUS_INCART ||
                    booking[0].status ==
                        sails.config.constants.BOOKING_STATUS_INITIATED ||
                    booking[0].status ==
                        sails.config.constants.BOOKING_STATUS_CONFIRMED
                ) {
                    if (booking[0].datetime > checkingTime) {
                        var refundAmount =
                            booking[0].total_amount -
                            sails.config.dynamics.CANCELLATION_FEE;
                        if (
                            booking[0].payment_status ==
                            sails.config.constants.PAYMENT_SUCCESS
                        ) {
                            if (
                                sails.config.dynamics.WALLET_ACTIVE &&
                                booking[0].payment_type ==
                                    sails.config.constants.BOOKING_TYPE_WALLET
                            ) {
                                var wallet = await Wallet.find({
                                    created_by: booking[0].created_by
                                }).limit(1);
                                var closing_balance = refundAmount;
                                if (wallet && wallet.length > 0) {
                                    await Wallet.update({
                                        id: wallet[0].id
                                    }).set({
                                        balance:
                                            parseFloat(wallet[0].balance) +
                                            parseFloat(refundAmount)
                                    });
                                    closing_balance =
                                        parseFloat(wallet[0].balance) +
                                        parseFloat(refundAmount);
                                } else {
                                    var secretCode = await Wallet.createSecret();
                                    await Wallet.create({
                                        secret_code: secretCode,
                                        balance: parseFloat(refundAmount),
                                        created_by: booking[0].created_by
                                    });
                                }
                                await WalletTransactions.create({
                                    wallet_id: wallet[0].id,
                                    heading: sails.__('Refund to wallet'),
                                    amount: refundAmount,
                                    closing_balance: closing_balance,
                                    user_id: booking[0].created_by,
                                    status:
                                        sails.config.constants
                                            .WALLET_TRANSACTION_SUCCESS,
                                    type: sails.config.constants.WALLET_TOPUP,
                                    created_by: booking[0].created_by,
                                    ipAddress: User.pushIpData(
                                        Api.filterIp(req.ip),
                                        null,
                                        req.options.action
                                    )
                                });
                                sails.hooks.email.send(
                                    'wallet-amount-refunded',
                                    {
                                        logoImage: logoImage,
                                        image: websiteImages,
                                        refundAmount: refundAmount,
                                        name: customer[0].name
                                    },
                                    {
                                        to: customer[0].email,
                                        subject: sails.__(
                                            'Wallet Refund: %s',
                                            sails.config.dynamics
                                                .APPLICATION_NAME
                                        )
                                    },
                                    async function(err) {
                                        if (err) {
                                            sails.sentry.captureException(err);
                                        }
                                    }
                                );
                                response.message = sails.__(
                                    'Booking cancelled successfully, amount has been refunded in your wallet'
                                );
                            } else {
                                sails.hooks.email.send(
                                    'amount-refund-time',
                                    {
                                        logoImage: logoImage,
                                        image: websiteImages,
                                        refundAmount: refundAmount,
                                        name: customer[0].name
                                    },
                                    {
                                        to: customer[0].email,
                                        subject: sails.__(
                                            'Wallet Refund: %s',
                                            sails.config.dynamics
                                                .APPLICATION_NAME
                                        )
                                    },
                                    async function(err) {
                                        if (err) {
                                            sails.sentry.captureException(err);
                                        }
                                    }
                                );
                                response.message = sails.__(
                                    'Booking cancelled successfully, amount will be refunded to your account within %s hours',
                                    sails.config.constants.REFUND_TIME_IN_HOURS
                                );
                            }
                        }
                        sails.hooks.email.send(
                            'booking-cancelled',
                            {
                                logoImage: logoImage,
                                image: websiteImages,
                                customer: customer[0].name,
                                token: booking[0].token,
                                name: provider[0].business_name
                            },
                            {
                                to: provider[0].email,
                                subject: sails.__(
                                    'Booking cancelled (%s): %s',
                                    customer[0].name,
                                    sails.config.dynamics.APPLICATION_NAME
                                )
                            },
                            async function(err) {
                                if (err) {
                                    sails.sentry.captureException(err);
                                }
                            }
                        );
                        await sails.helpers.notification.with({
                            user_id: booking[0].created_by,
                            type: 'BOOKING_CANCELLED',
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
                                    .BOOKING_CANCELLED,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id,
                            log_error: false
                        });
                        await sails.helpers.notification.with({
                            user_id: booking[0].created_by,
                            type: 'BOOKING_CANCELLED',
                            variables: customer[0].name,
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
                                    .BOOKING_CANCELLED,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: booking[0].id,
                            log_error: false
                        });
                        var cancelStatus =
                            sails.config.constants.BOOKING_STATUS_CANCELLED;
                        if (user.role == sails.config.constants.ROLE_PROVIDER) {
                            cancelStatus =
                                sails.config.constants
                                    .BOOKING_STATUS_CANCELLED_PROVIDER;
                        }
                        await Booking.update({
                            id: bookingId
                        }).set({
                            status: cancelStatus
                        });
                        response.status = 'OK';
                        var updatedbooking = await Booking.find({
                            id: bookingId,
                            provider_id: userId
                        }).limit(1);
                        response.data = await Booking.getListJson(
                            updatedbooking[0]
                        );
                        return res.send(response);
                    } else {
                        response.message = sails.__(
                            'Booking cannot be cancelled'
                        );
                        return res.send(response);
                    }
                } else {
                    response.message = sails.__(
                        'Booking cannot be cancelled now'
                    );
                    return res.send(response);
                }
            } else {
                response.message = sails.__('Invalid request');
                return res.send(response);
            }
        } else {
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
