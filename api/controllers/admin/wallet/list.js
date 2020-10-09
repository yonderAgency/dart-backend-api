module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var userId = req.param('customerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var wallet = await Wallet.find({
            created_by: userId
        }).limit(1);
        if (wallet.length > 0) {
            var json = [];
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Wallet.getJson(wallet[0], 20, true);
            return res.json(response);
        } else {
            response.message = sails.__('No list found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
