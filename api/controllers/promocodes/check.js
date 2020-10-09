module.exports = async function check(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const code = req.param('promoCode');
    const packageSelected = req.param('packageSelected');
    const customer = req.authUser;

    if (code == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var promoCode = await PromoCodes.find({
            code: code
        })
            .sort('created_at DESC')
            .limit(1);
        if (promoCode && promoCode.length > 0) {
            if (promoCode[0].status == sails.config.constants.STATUS_ACTIVE) {
                var check = await PromoCodes.checkEligibility(
                    customer,
                    promoCode[0]
                );
                if (check.status == 'OK') {
                    if (packageSelected && packageSelected.length > 0) {
                        var amount = await ProviderServiceAddon.getAmount(
                            packageSelected,
                            promoCode[0].percent_amount,
                            promoCode[0].upto_amount
                        );
                        response.status = 'OK';
                        response.message = sails.__(
                            'Promo code applied successfully'
                        );
                        response.data = {
                            promoCode: await PromoCodes.getJson(promoCode[0]),
                            amount: amount
                        };
                    } else {
                        response.status = 'OK';
                        response.message = sails.__(
                            'Promo code applied successfully'
                        );
                        response.data = {
                            promoCode: await PromoCodes.getJson(promoCode[0]),
                            amount: 0
                        };
                    }
                } else {
                    response.message = check.message;
                }
            } else {
                response.message = sails.__(
                    sails.config.constants.PROMO_INACTIVE_CODE
                );
            }
        } else {
            response.message = sails.__(
                sails.config.constants.PROMO_INVALID_CODE
            );
        }
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
