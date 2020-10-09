module.exports = async function dashboard(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const customerId = req.param('customerId');

    if (typeof customerId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const user = await User.find({
            id: customerId
        }).limit(1);
        if (user.length > 0) {
            var transactionCount = await Transactions.count({
                or: [
                    {
                        from_id: customerId
                    },
                    {
                        to: customerId
                    }
                ]
            });
            var bookingCount = await Booking.count({
                created_by: customerId
            });
            var wallet = await Wallet.find({
                created_by: customerId
            });
            var walletBalance = 0;
            if (wallet && wallet.length > 0) {
                walletBalance = wallet[0].balance;
            }
            var favoriteCount = await Favoriteservice.count({
                created_by: customerId
            });
            response.status = 'OK';
            response.data = {
                transactionCount: transactionCount,
                bookingCount: bookingCount,
                walletBalance: walletBalance,
                favoriteCount: favoriteCount
            };
            return res.send(response);
        } else {
            response.message = sails.__('Invalid Request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
