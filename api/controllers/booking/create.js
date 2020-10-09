const moment = require('moment');

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedUser = req.authUser;
    const payment_type = req.param('paymentType');
    const note = req.param('note');
    const delivery_type = req.param('deliveryType');
    if (
        typeof payment_type == 'undefined' ||
        typeof delivery_type == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const checkPaymentMethods = await Booking.checkPaymentMethods(
            payment_type
        );
        if (!checkPaymentMethods) {
            response.message = sails.__('Invalid payment method used');
            return res.send(response);
        }

        var cartExist = await Cart.find({
            created_by: loggedUser.id,
        })
            .sort('created_at DESC')
            .limit(1);
        if (cartExist.length == 0) {
            response.message = sails.__('Invalid request');
            return res.send(response);
        }
        let checkLocation = await Cart.checkCompleteAddressByHavershine(
            cartExist[0]
        );
        if (!checkLocation) {
            response.message = sails.__(
                'Your location is too far from the restaurant, please pick any other location'
            );
            return res.send(response);
        }

        if (cartExist[0].items.length > 0) {
            for (x in cartExist[0].items) {
                const verify = await Cart.verifyItem(
                    cartExist[0].items[x],
                    cartExist[0].provider_id,
                    cartExist[0].provider_address_id
                );
                if (!verify) {
                    response.message = sails.__('Invalid item');
                    return res.send(response);
                }
            }
        }

        var token =
            sails.config.dynamics.BOOKING_PREFIX + (await Api.generatedCode(6));
        var booking = {};
        booking.token = token;
        booking.provider_id = cartExist[0].provider_id;
        booking.customer_address_id = cartExist[0].customer_address_id;
        booking.provider_address_id = cartExist[0].provider_address_id;
        booking.note = note;
        booking.payment_status = sails.config.constants.PAYMENT_PENDING;
        booking.payment_type = payment_type;
        booking.delivery_type = delivery_type;
        booking.promo_code = req.param('promoId');
        booking.ipAddress = User.pushIpData(
            Api.filterIp(req.ip),
            null,
            req.options.action
        );
        var promoCodeModel = null;
        if (typeof booking.promo_code != 'undefined') {
            promoCodeModel = await PromoCodes.find({
                id: booking.promo_code,
                status: sails.config.constants.STATUS_ACTIVE,
            })
                .sort('created_at DESC')
                .limit(1);
            if (promoCodeModel && promoCodeModel.length > 0) {
                var check = await PromoCodes.checkEligibility(
                    loggedUser,
                    promoCodeModel[0]
                );
                if (check.status == 'OK') {
                    booking.promo_code = promoCodeModel[0].id;
                } else {
                    response.message = check.message;
                    return res.send(response);
                }
            }
        }
        booking.status = sails.config.constants.BOOKING_STATUS_INCART;
        booking.created_by = loggedUser.id;
        if (booking.datetime < moment().valueOf()) {
            response.message = sails.__('You cannot book at this time');
            return res.send(response);
        }
        const providerModel = await ProviderProfile.find({
            created_by: booking.provider_id,
        }).limit(1);
        let checkBusinessHours = await Api.checkForBusinessHours(
            booking.provider_id,
            req.param('day'),
            req.param('offset')
        );
        if (checkBusinessHours && providerModel.length > 0) {
            await Booking.create(booking);
            const createdBooking = await Booking.find({
                token: token,
            }).limit(1);
            if (createdBooking && createdBooking.length > 0) {
                var cartItems = cartExist[0].items;
                if (cartItems && cartItems.length > 0) {
                    for (x in cartItems) {
                        var providerService = await ProviderService.find({
                            id: cartItems[x].itemId,
                        });
                        if (providerService && providerService.length > 0) {
                            if (
                                providerService[0].category_id != null &&
                                providerService[0].service_id != null &&
                                providerService[0].price > 0
                            ) {
                                let newAddonArray = [];
                                let addOns = cartItems[x].addOns;
                                if (addOns && addOns.length > 0) {
                                    for (y in addOns) {
                                        var tempAddon = await ProviderServiceAddon.find(
                                            {
                                                id: addOns[y].id,
                                            }
                                        ).limit(1);
                                        if (tempAddon && tempAddon.length > 0) {
                                            newAddonArray.push({
                                                id: tempAddon[0].id,
                                                price: tempAddon[0].price,
                                                selected: true,
                                            });
                                        }
                                    }
                                }
                                cartItems[x].addOns = newAddonArray;
                                cartItems[x].package_id = providerService[0].id;
                                cartItems[x].category_id =
                                    providerService[0].category_id;
                                cartItems[x].service_id =
                                    providerService[0].service_id;
                                cartItems[x].price = providerService[0].price;
                            }
                        }
                    }
                    await BookingItem.create({
                        package_id: cartItems,
                        booking_id: createdBooking[0].id,
                        created_by: loggedUser.id,
                    });
                    const amount = await Cart.getAmountForBooking(
                        cartItems,
                        createdBooking[0].id,
                        loggedUser.id,
                        createdBooking[0].promo_code,
                        delivery_type
                    );
                    if (
                        booking.payment_type ==
                        sails.config.constants.BOOKING_TYPE_CASH
                    ) {
                        const currentPaymentStatus =
                            sails.config.constants.PAYMENT_PENDING;
                        await Booking.update({
                            id: createdBooking[0].id,
                        }).set({
                            payment_status: currentPaymentStatus,
                            status:
                                sails.config.constants.BOOKING_STATUS_INITIATED,
                            total_amount: amount ? amount : 0,
                        });
                        await sails.helpers.notification.with({
                            user_id: booking.provider_id,
                            type: 'NEW_BOOKING_REQUEST',
                            variables: loggedUser.name,
                            dataPacket: {
                                params: {
                                    bookingDetail: {
                                        key: createdBooking[0].id,
                                    },
                                    showAlert: false,
                                },
                                type: sails.config.constants.RELOAD_BOOKING,
                                route:
                                    sails.config.constants.ROUTE_BOOKING_DETAIL,
                            },
                            reference_type:
                                sails.config.constants.NOTIFICATIONS
                                    .NEW_BOOKING_REQUEST,
                            status:
                                sails.config.constants
                                    .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                            reference_id: createdBooking[0].id,
                        });
                    } else if (
                        booking.payment_type ==
                        sails.config.constants.BOOKING_TYPE_WALLET
                    ) {
                        var wallet = await Wallet.find({
                            created_by: loggedUser.id,
                        }).limit(1);
                        if (wallet.length > 0) {
                            var remainingAmount =
                                parseFloat(wallet[0].balance) -
                                parseFloat(amount);
                            if (remainingAmount >= 0) {
                                await WalletTransactions.create({
                                    wallet_id: wallet[0].id,
                                    heading: 'Paid by wallet',
                                    amount: amount ? amount : 0,
                                    closing_balance: remainingAmount,
                                    user_id: loggedUser.id,
                                    status:
                                        sails.config.constants
                                            .WALLET_TRANSACTION_SUCCESS,
                                    type:
                                        sails.config.constants.WALLET_DEDUCTION,
                                    created_by: loggedUser.id,
                                    ipAddress: User.pushIpData(
                                        Api.filterIp(req.ip),
                                        null,
                                        req.options.action
                                    ),
                                });
                                var walletTransaction = await WalletTransactions.find(
                                    {
                                        wallet_id: wallet[0].id,
                                        created_by: loggedUser.id,
                                    }
                                )
                                    .sort('created_at DESC')
                                    .limit(1);
                                await Wallet.update({
                                    id: wallet[0].id,
                                }).set({
                                    balance: remainingAmount,
                                    updated_at: moment.utc().valueOf(),
                                });
                                await Booking.update({
                                    id: createdBooking[0].id,
                                }).set({
                                    total_amount: amount ? amount : 0,
                                    payment_status:
                                        sails.config.constants.PAYMENT_SUCCESS,
                                    status:
                                        sails.config.constants
                                            .BOOKING_STATUS_INITIATED,
                                    customer_approved: true,
                                });
                                await Transactions.create({
                                    reference_id: createdBooking[0].id,
                                    payment_medium:
                                        sails.config.constants
                                            .TRANSACTION_REFERENCE_MEDIUM_WALLET,
                                    payment_medium_id: wallet[0].id,
                                    transaction_id: walletTransaction[0].id,
                                    amount: amount ? amount : 0,
                                    status:
                                        sails.config.constants
                                            .TRANSACTION_SUCCESS,
                                    from_id: createdBooking[0].created_by,
                                    from_role:
                                        sails.config.constants.ROLE_CUSTOMER,
                                    to_id: createdBooking[0].provider_id,
                                    to_role:
                                        sails.config.constants.ROLE_PROVIDER,
                                    split_details: await Transactions.splitCuts(
                                        amount ? amount : 0,
                                        providerModel[0],
                                        createdBooking[0].delivery_assigned
                                    ),
                                    ipAddress: User.pushIpData(
                                        Api.filterIp(req.ip),
                                        null,
                                        req.options.action
                                    ),
                                });
                                await sails.helpers.notification.with({
                                    user_id: booking.provider_id,
                                    type: 'NEW_BOOKING_REQUEST',
                                    variables: loggedUser.name,
                                    dataPacket: {
                                        params: {
                                            bookingDetail: {
                                                key: createdBooking[0].id,
                                            },
                                            showAlert: false,
                                        },
                                        type:
                                            sails.config.constants
                                                .RELOAD_BOOKING,
                                        route:
                                            sails.config.constants
                                                .ROUTE_BOOKING_DETAIL,
                                    },
                                    reference_type:
                                        sails.config.constants.NOTIFICATIONS
                                            .NEW_BOOKING_REQUEST,
                                    status:
                                        sails.config.constants
                                            .NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                                    reference_id: createdBooking[0].id,
                                });
                                await Booking.updateDueAmount({
                                    total_amount: amount,
                                    provider_id: createdBooking[0].provider_id,
                                    payment_type:
                                        createdBooking[0].payment_type,
                                });
                            } else {
                                response.message = sails.__(
                                    'You have insufficient credits in your wallet'
                                );
                                return res.send(response);
                            }
                        } else {
                            response.message = sails.__(
                                'You have no credits in your wallet'
                            );
                            return res.send(response);
                        }
                    } else {
                        await Booking.update({
                            id: createdBooking[0].id,
                        }).set({
                            total_amount: amount ? amount : 0,
                        });
                    }
                    var user = await User.find({
                        id: createdBooking[0].provider_id,
                    }).limit(1);
                    let websiteImages = await Api.getWebsiteImage();
                    sails.hooks.email.send(
                        'booking',
                        {
                            name: user[0].name,
                            token: createdBooking[0].token,
                            image: websiteImages,
                        },
                        {
                            to: user[0].email,
                            subject: sails.__(
                                'New booking at %s',
                                sails.config.dynamics.APPLICATION_NAME
                            ),
                        },
                        function (err) {
                            if (err) {
                                sails.log.error(err);
                                response.message = err;
                                return res.send(response);
                            }
                        }
                    );
                    const finalBooking = await Booking.find({
                        id: createdBooking[0].id,
                    }).limit(1);
                    var finalData = await Booking.getJson(
                        finalBooking[0],
                        true
                    );
                    await Cart.update({
                        id: cartItems[0].id,
                    }).set({
                        items: [],
                        provider_id: null,
                        provider_address_id: null,
                    });
                    response.status = 'OK';
                    response.data = finalData;
                    response.message = sails.__('Order placed Successfully');
                    console.log({ response });
                    return res.send(response);
                }
            } else {
                console.log('daf');
                response.message = sails.__('No items in your cart');
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid request');
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
