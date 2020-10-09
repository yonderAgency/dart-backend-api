const moment = require('moment');

module.exports = async function pay(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.param('providerId');
    var tokens = [];
    try {
        const user = await User.find({
            id: providerId
        }).limit(1);
        if (user) {
            let tokensBookings = await Booking.find({
                where: {
                    provider_id: providerId,
                    payment_status: sails.config.constants.PAYMENT_SUCCESS,
                    is_due_paid: false
                }
            });
            if (tokensBookings && tokensBookings.length > 0) {
                for (x in tokensBookings) {
                    tokens.push(tokensBookings[x].token);
                }
            }
            await Booking.update({
                provider_id: providerId,
                payment_status: sails.config.constants.PAYMENT_SUCCESS,
                is_due_paid: false
            }).set({
                is_due_paid: true
            });
            let providerProfile = await ProviderProfile.find({
                created_by: providerId
            }).limit(1);
            if (providerProfile && providerProfile.length > 0) {
                await PaymentLog.create({
                    provider_id: providerId,
                    amount: providerProfile[0].due_amount,
                    tokens: tokens,
                    created_by: providerId
                });
            }
            await ProviderProfile.update({
                created_by: providerId
            }).set({
                due_amount: 0.0,
                last_paid_time: moment().valueOf()
            });
            response.status = 'OK';
            response.message = sails.__(
                'Paid to provider, cleared the pending amount successfully'
            );
            return res.send(response);
        } else {
            response.message == sails.__('Invalid request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
