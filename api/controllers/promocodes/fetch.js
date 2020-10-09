const moment = require('moment');

module.exports = async function fetch(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    try {
        var packet = [];
        var promos = await PromoCodes.find({
            advertise_on: {
                '<=': moment().valueOf()
            },
            start_date: {
                '<=': moment().valueOf()
            },
            end_date: {
                '>': moment().valueOf()
            },
            deleted_at: null,
            status: sails.config.constants.STATUS_ACTIVE
        })
            .sort('end_date DESC')
            .limit(20);
        if (promos && promos.length > 0) {
            for (x in promos) {
                packet.push(await PromoCodes.getJson(promos[x]));
            }
            response.status = 'OK';
            response.data = packet;
            response.message = sails.__('Success');
            return res.json(response);
        }
        response.message = sails.__('No promo code found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
