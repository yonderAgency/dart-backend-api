module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedInUser = req.authUser;
    try {
        var cart = await Cart.find({
            created_by: loggedInUser.id
        }).limit(1);
        if (cart && cart.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Cart.getJson(cart[0]);
            return res.send(response);
        }
        response.message = sails.__('Unable to fetch cart items');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
