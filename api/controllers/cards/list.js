var stripe = require('stripe')(sails.config.dynamics.STRIPE_SECRET);

module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedInUser = req.authUser;

    try {
        if (loggedInUser) {
            if (loggedInUser.stripe_id) {
                stripe.customers.retrieve(loggedInUser.stripe_id, function(
                    err,
                    customer
                ) {
                    if (err) {
                        sails.sentry.captureException(err);
                        response.status = 'NOK';
                        response.message = sails.__(
                            'Unable to fetch card details'
                        );
                        response.returnObject = err;
                        return res.send(response);
                    } else {
                        response.data = customer;
                        response.status = 'OK';
                        response.message = sails.__('Success');
                        return res.send(response);
                    }
                });
            } else {
                response.message = sails.__('You need to add your first card');
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
