const stripe = require('stripe')(sails.config.dynamics.STRIPE_SECRET);

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var loggedInUser = req.authUser;
    var stripeToken = req.param('stripeToken');
    var type = req.param('type');
    var customer_id = '';

    if (typeof stripeToken == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (loggedInUser) {
            if (loggedInUser.stripe_id) {
                customer_id = loggedInUser.stripe_id;
            } else {
                const customer = await stripe.customers.create({
                    email: loggedInUser.email
                });
                if (customer && customer.id.length > 0) {
                    customer_id = customer.id;
                } else {
                    response.status = 'NOK';
                    response.message = customer.message
                        ? customer.message
                        : sails.__('Unable to add card please try again');
                    return res.send(response);
                }
            }
            if (customer_id) {
                await stripe.customers.createSource(
                    customer_id,
                    { source: stripeToken },
                    async function(err, card) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.status = 'NOK';
                            response.message = err.message
                                ? err.message
                                : sails.__(
                                      'Unable to add card please try again'
                                  );
                            return res.send(response);
                        } else {
                            var savedCards = loggedInUser.cards;
                            if (savedCards.length > 0) {
                                if (savedCards.indexOf(card.id) != -1) {
                                    response.status = 'NOK';
                                    response.message = sails.__(
                                        'Card already saved'
                                    );
                                    return res.send(response);
                                } else {
                                    savedCards.push({
                                        card_id: card.id
                                    });
                                }
                            } else {
                                var savedCards = [];
                                savedCards.push({
                                    card_id: card.id
                                });
                            }
                            await User.update({
                                id: loggedInUser.id
                            }).set({
                                stripe_id: customer_id,
                                cards: savedCards,
                                ipAddress: User.pushIpData(
                                    Api.filterIp(req.ip),
                                    loggedInUser.ipAddress,
                                    req.options.action
                                )
                            });
                            response.status = 'OK';
                            response.data = card;
                            response.message = sails.__(
                                'Card saved successfully'
                            );
                            return res.send(response);
                        }
                    }
                );
            } else {
                response.message = sails.__('Unable to complete payment');
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid User');
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
