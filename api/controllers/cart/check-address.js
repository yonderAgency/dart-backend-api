module.exports = async function checkAddress(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedUser = req.authUser;
    const providerAddress = req.param('providerAddress');
    const customerAddress = req.param('customerAddress');

    try {
        if (
            providerAddress.latitude != null &&
            providerAddress.longitude != null &&
            customerAddress.latitude != null &&
            customerAddress.longitude != null &&
            providerAddress.id != null &&
            customerAddress.id != null
        ) {
            const possibility = Cart.checkAddressByHavershine(
                sails.config.dynamics.SEARCH_RADIUS,
                providerAddress.latitude,
                providerAddress.longitude,
                customerAddress.latitude,
                customerAddress.longitude
            );
            if (possibility) {
                var cart = await Cart.find({
                    created_by: loggedUser.id
                }).limit(1);
                if (cart && cart.length > 0) {
                    const addresses = await UserAddress.find({
                        id: {
                            in: [providerAddress.id, customerAddress.id]
                        }
                    });
                    if (addresses && addresses.length == 2) {
                        await Cart.update({
                            created_by: loggedUser.id
                        }).set({
                            provider_address_id: providerAddress.id,
                            customer_address_id: customerAddress.id
                        });
                        response.status = 'OK';
                        response.message = sails.__('Success');
                        return res.send(response);
                    } else {
                        response.message = sails.__('Invalid request');
                        return res.send(response);
                    }
                }
            } else {
                response.message = sails.__(
                    'Your location is too far from the restaurant, please pick any other location'
                );
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid request');
            return res.send(response);
        }
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
