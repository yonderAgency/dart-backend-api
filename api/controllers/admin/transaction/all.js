module.exports = async function all(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var limit = req.param('limit') || 50;
    var userId = req.param('customerId');

    try {
        var transactions = [];
        if (typeof userId != 'undefined' && userId != '') {
            transactions = await Transactions.find({
                or: [{ to_id: userId }, { from_id: userId }]
            })
                .sort('created_at DESC')
                .limit(limit);
        } else {
            transactions = await Transactions.find()
                .sort('created_at DESC')
                .limit(limit);
        }

        if (transactions.length > 0) {
            var json = [];
            if (transactions.length > 0) {
                for (x in transactions) {
                    json.push(await Transactions.getJson(transactions[x]));
                }
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.json(response);
        } else {
            response.message = sails.__('No transaction found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
