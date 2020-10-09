var stripe = require('stripe')(sails.config.dynamics.STRIPE_SECRET);
const moment = require('moment');

module.exports = async function addStripe(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var user = req.authUser;

    const accountNumber = req.param('accountNumber');
    const routingNumber = req.param('routingNumber');
    const ssn = req.param('ssn');
    const address = req.param('address');
    const city = req.param('city');
    const stateVal = req.param('stateVal');
    const zipcode = req.param('zipcode');
    const dob = req.param('dob');
    const type = req.param('type');

    if (
        typeof accountNumber == 'undefined' ||
        typeof address == 'undefined' ||
        typeof city == 'undefined' ||
        typeof zipcode == 'undefined' ||
        typeof dob == 'undefined' ||
        typeof type == 'undefined' ||
        typeof routingNumber == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    try {
        let account = await stripe.accounts.create({
            type: 'custom',
            country: user.country,
            email: user.email,
            external_account: {
                country: user.country,
                currency: 'usd',
                account_number: accountNumber,
                object: 'bank_account',
                routing_number: routingNumber
            },
            tos_acceptance: {
                date: parseInt(moment().valueOf() / 1000),
                ip: req.ip
            },
            legal_entity: {
                dob: {
                    day: 10,
                    month: 05,
                    year: 1995
                },
                address: {
                    city: city,
                    line1: address,
                    postal_code: zipcode,
                    state: stateVal
                },
                ssn_last_4: ssn ? ssn : null,
                first_name: user.name,
                last_name: user.name,
                type: type
            }
        });
        if (account) {
            await User.update({
                id: user.id
            }).set({
                stripe_id: account.id,
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    user.ipAddress,
                    req.options.action
                )
            });
            response.status = 'OK';
            response.message = sails.__('Stripe account created successfully');
            return res.json(response);
        }
        response.status = 'OK';
        response.message = sails.__('Unable to create ');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = err.message;
        return res.send(response);
    }
};
