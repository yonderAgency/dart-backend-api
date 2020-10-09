module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    try {
        var codes = await PromoCodes.find().sort('created_at DESC');
        if (codes) {
            json = [];
            for (x in codes) {
                json.push(await PromoCodes.getJson(codes[x]));
            }
            if (json.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = json;
                return res.json(response);
            }
            response.status = 'OK';
            response.message = sails.__('No promo found');
            return res.json(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No promo found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
