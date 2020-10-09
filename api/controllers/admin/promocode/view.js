module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const promocode_id = req.param('promocodeId');

    if (typeof promocode_id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var code = await PromoCodes.find({
            id: promocode_id
        }).limit(1);
        if (code && code.length > 0) {
            response.status = 'OK';
            response.data = await PromoCodes.getJson(code[0]);
            response.message = sails.__('Success');
            return res.json(response);
        } else {
            response.message = sails.__('No promo found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
