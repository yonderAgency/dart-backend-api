const moment = require('moment');

module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var limit = req.param('limit');

    if (typeof limit == 'undefined') {
        limit = 5;
    }

    try {
        var offers = await PromoCodes.find({
            advertise: true,
            times_type: sails.config.constants.PROMO_TYPE_UNLIMITED,
            status: sails.config.constants.STATUS_ACTIVE,
            advertise_on: {
                '<=': moment().valueOf()
            },
            start_date: {
                '<=': moment().valueOf()
            },
            end_date: {
                '>': moment().valueOf()
            },
            deleted_at: null
        })
            .sort([{ offer_type: 'ASC' }, { created_at: 'DESC' }])
            .limit(limit);
        if (offers) {
            var json = [];
            for (x in offers) {
                json.push(await PromoCodes.getAdvertiseJson(offers[x]));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.send(response);
        } else {
            response.message = sails.__('No offer found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
