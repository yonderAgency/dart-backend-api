module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const user = req.authUser;
    let limit = req.param('limit');
    if (typeof limit == 'undefined') {
        limit = 10;
    }
    let page = req.param('page');
    if (typeof page == 'undefined') {
        page = 1;
    }

    try {
        let allTransactions = await Transactions.count({
            or: [
                {
                    to_id: user.id
                },
                {
                    from_id: user.id
                }
            ]
        });
        let transactions = await Transactions.find({
            or: [
                {
                    to_id: user.id
                },
                {
                    from_id: user.id
                }
            ]
        })
            .limit(limit)
            .skip((page - 1) * limit);
        let list = [];
        if (transactions.length > 0) {
            for (x in transactions) {
                list.push(await Transactions.getJson(transactions));
            }
            response.totalPages = Math.ceil(allTransactions / limit);
            response.next = response.totalPages - page > 0 ? true : false;
            response.previous = page > 1 ? true : false;
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data.providerList = list;
            response.data.page = page;
            return res.send(response);
        }
        response.message = sails.__('No transactions found');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
