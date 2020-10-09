module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedUser = req.authUser;
    const provider_id = req.param('providerId');
    const cartItem = req.param('cartItem');
    const index = req.param('index');

    if (
        typeof provider_id == 'undefined' ||
        typeof cartItem == 'undefined' ||
        typeof index == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var cartExist = await Cart.find({
            created_by: loggedUser.id
        }).limit(1);
        if (cartExist && cartExist.length > 0) {
            const verify = await Cart.verifyItemOnUpdate(
                cartItem,
                provider_id,
                cartExist[0].provider_address_id
            );
            if (verify.status) {
                var existingItems = cartExist[0].items;
                existingItems[index] = cartItem;
                await Cart.update({
                    created_by: loggedUser.id
                }).set({
                    items: existingItems,
                    provider_id: provider_id
                });
                response.status = 'OK';
                response.message = sails.__('Success');
                return res.send(response);
            }
            if (verify.status == false) {
                response.message = sails.__(verify.message);
                return res.send(response);
            }
            response.message = sails.__('Invalid item');
            return res.send(response);
        } else {
            response.message = sails.__('Invalid request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
