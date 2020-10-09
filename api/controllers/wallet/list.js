module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const user = req.authUser;

    try {
        var wallet = await Wallet.find({
            created_by: user.id
        }).limit(1);
        if (wallet.length > 0) {
            response.status = 'OK';
            response.data = await Wallet.getJson(wallet[0], 20, true);
            response.message = sails.__('Success');
            return res.send(response);
        }
        response.message = sails.__('Wallet not found, please contact admin');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
