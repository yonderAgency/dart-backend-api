var stripe = require('stripe')(sails.config.dynamics.STRIPE_SECRET);

module.exports = async function remove(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const loggedInUser = req.authUser;
    const cardToken = await req.param('cardToken');

    if (typeof cardToken == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (loggedInUser) {
            if (loggedInUser.stripe_id) {
                stripe.customers.deleteCard(
                    loggedInUser.stripe_id,
                    cardToken,
                    async function(err, confirmation) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.status = 'NOK';
                            response.message = sails.__(
                                'Unable to add card please try again'
                            );
                            response.returnObject = err;
                            return res.send(response);
                        } else {
                            var cards = loggedInUser.cards;
                            cards = cards.filter(function(item, index) {
                                if (item.card_id == cardToken) {
                                    return false;
                                }
                                return true;
                            });
                            await User.update({
                                id: loggedInUser.id
                            }).set({
                                cards: cards,
                                ipAddress: User.pushIpData(
                                    Api.filterIp(req.ip),
                                    loggedInUser.ipAddress,
                                    req.options.action
                                )
                            });
                            response.data = confirmation;
                            response.status = 'OK';
                            response.message = sails.__('Deleted successfully');
                            return res.send(response);
                        }
                    }
                );
            } else {
                response.message = sails.__("You don't have any saved cards");
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
