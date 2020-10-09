const path = require('path');
const stripe = require('stripe')(sails.config.dynamics.STRIPE_SECRET);

module.exports = async function addAmount(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const user = req.authUser.id;
    // const stripeToken = req.param('stripeToken');
    // const cardId = req.param('cardId');
    const amount = req.param('amount');
    const to_user = req.param('to_user');
    const targetUser = await User.find({
        id: to_user ? to_user : user
    }).limit(1);

    if (
        typeof stripeToken != 'undefined' &&
        typeof amount != 'undefined' &&
        typeof cardId != 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (amount) {
            var wallet = await Wallet.find({
                created_by: to_user ? to_user : targetUser[0].id
            }).limit(1);
            if (wallet.length > 0) {
                if (cardId) {
                    let isPresent = false;
                    targetUser[0].cards.map(function(item, index) {
                        if (item.card_id == cardId) {
                            isPresent = true;
                        }
                    });
                    if (isPresent) {
                        stripe.charges.create(
                            {
                                amount: amount * 100,
                                currency: sails.config.dynamics.CURRENCY,
                                customer: targetUser[0].stripe_id,
                                source: cardId
                            },
                            async function(err, charge) {
                                if (err) {
                                    sails.sentry.captureException(err);
                                    response.message = err.message
                                        ? err.message
                                        : sails.__(
                                              'Unable to complete the payment'
                                          );
                                    await WalletTransactions.create({
                                        wallet_id: wallet[0].id,
                                        heading: sails.__(
                                            'Wallet transaction failed'
                                        ),
                                        amount: amount,
                                        closing_balance: wallet[0].balance,
                                        user_id: targetUser[0].id,
                                        transaction_id: err.request_id,
                                        status:
                                            sails.config.constants
                                                .WALLET_TRANSACTION_FAILED,
                                        type:
                                            sails.config.constants.WALLET_TOPUP,
                                        created_by: to_user
                                            ? to_user
                                            : targetUser[0].id,
                                        ipAddress: User.pushIpData(
                                            Api.filterIp(req.ip),
                                            user,
                                            req.options.action
                                        )
                                    });
                                    return res.send(response);
                                } else {
                                    await WalletTransactions.create({
                                        wallet_id: wallet[0].id,
                                        heading: sails.__(
                                            '%s added to Wallet',
                                            amount
                                        ),
                                        amount: amount,
                                        closing_balance:
                                            parseFloat(wallet[0].balance) +
                                            parseFloat(amount),
                                        user_id: targetUser[0].id,
                                        transaction_id: charge.id,
                                        status:
                                            sails.config.constants
                                                .WALLET_TRANSACTION_SUCCESS,
                                        type:
                                            sails.config.constants.WALLET_TOPUP,
                                        created_by: to_user
                                            ? to_user
                                            : targetUser[0].id,
                                        ipAddress: User.pushIpData(
                                            Api.filterIp(req.ip),
                                            user,
                                            req.options.action
                                        )
                                    });
                                    await Wallet.update({
                                        id: wallet[0].id
                                    }).set({
                                        balance:
                                            parseFloat(wallet[0].balance) +
                                            parseFloat(amount)
                                    });
                                    var pathName = path.parse(
                                        '/assets/images/website-logo.png'
                                    );
                                    var logoImage =
                                        sails.config.constants.BASE_URL +
                                        pathName.dir +
                                        '/' +
                                        pathName.base;
                                    let websiteImages = await Api.getWebsiteImage();
                                    sails.hooks.email.send(
                                        'wallet-amount-added',
                                        {
                                            name: targetUser[0].name,
                                            logoImage: logoImage,
                                            image: websiteImages,
                                            refundAmount: amount
                                        },
                                        {
                                            to: targetUser[0].email,
                                            subject: sails.__(
                                                'Wallet amount updated: %s',
                                                sails.config.dynamics
                                                    .APPLICATION_NAME
                                            )
                                        },
                                        async function(err) {
                                            if (err) {
                                                sails.sentry.captureException(
                                                    err
                                                );
                                                response.message = err;
                                                return res.json(response);
                                            }
                                            response.status = 'OK';
                                            response.data = charge;
                                            response.message = sails.__(
                                                'Transaction successful'
                                            );
                                            return res.send(response);
                                        }
                                    );
                                }
                            }
                        );
                    } else {
                        response.message = sails.__('Invalid card selected');
                        await WalletTransactions.create({
                            wallet_id: wallet[0].id,
                            heading: sails.__('Wallet transaction failed'),
                            amount: amount,
                            closing_balance: parseFloat(wallet[0].balance),
                            user_id: targetUser[0].id,
                            status:
                                sails.config.constants
                                    .WALLET_TRANSACTION_FAILED,
                            type: sails.config.constants.WALLET_TOPUP,
                            created_by: to_user ? to_user : targetUser[0].id,
                            ipAddress: User.pushIpData(
                                Api.filterIp(req.ip),
                                user,
                                req.options.action
                            )
                        });
                        return res.send(response);
                    }
                } else {
                    stripe.charges.create(
                        {
                            amount: amount * 100,
                            currency: sails.config.dynamics.CURRENCY,
                            source: stripeToken
                        },
                        async function(err, charge) {
                            if (err) {
                                sails.sentry.captureException(err);
                                response.message = err.message
                                    ? err.message
                                    : sails.__(
                                          'Unable to complete the payment'
                                      );
                                await WalletTransactions.create({
                                    wallet_id: wallet[0].id,
                                    heading: sails.__(
                                        'Wallet transaction failed'
                                    ),
                                    amount: amount,
                                    closing_balance: parseFloat(
                                        wallet[0].balance
                                    ),
                                    user_id: targetUser[0].id,
                                    transaction_id: err.request_id,
                                    status:
                                        sails.config.constants
                                            .WALLET_TRANSACTION_FAILED,
                                    type: sails.config.constants.WALLET_TOPUP,
                                    created_by: to_user
                                        ? to_user
                                        : targetUser[0].id,
                                    ipAddress: User.pushIpData(
                                        Api.filterIp(req.ip),
                                        user,
                                        req.options.action
                                    )
                                });
                                return res.send(response);
                            } else {
                                await WalletTransactions.create({
                                    wallet_id: wallet[0].id,
                                    heading: sails.__(
                                        '%s added to Wallet',
                                        amount
                                    ),
                                    amount: amount,
                                    closing_balance:
                                        parseFloat(wallet[0].balance) +
                                        parseFloat(amount),
                                    user_id: targetUser[0].id,
                                    transaction_id: charge.id,
                                    status:
                                        sails.config.constants
                                            .WALLET_TRANSACTION_SUCCESS,
                                    type: sails.config.constants.WALLET_TOPUP,
                                    created_by: to_user
                                        ? to_user
                                        : targetUser[0].id,
                                    ipAddress: User.pushIpData(
                                        Api.filterIp(req.ip),
                                        user,
                                        req.options.action
                                    )
                                });
                                await Wallet.update({
                                    id: wallet[0].id
                                }).set({
                                    balance:
                                        parseFloat(wallet[0].balance) +
                                        parseFloat(amount)
                                });
                                response.status = 'OK';
                                response.data = charge;
                                response.message = sails.__(
                                    'Transaction successful'
                                );
                                return res.send(response);
                            }
                        }
                    );
                }
            }
        } else {
            response.message = sails.__('Invalid data');
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
