module.exports = async function deleteItem(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedUser = req.authUser;
    const index = req.param('index');

    if (typeof index == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var cartExist = await Cart.find({
            created_by: loggedUser.id
        }).limit(1);
        if (cartExist && cartExist.length > 0) {
            var existingItems = cartExist[0].items;
            if (existingItems[index]) {
                existingItems.splice(index, 1);
                if (existingItems.length > 0) {
                    await Cart.update({
                        created_by: loggedUser.id
                    }).set({
                        items: existingItems
                    });
                } else {
                    await Cart.update({
                        created_by: loggedUser.id
                    }).set({
                        items: [],
                        provider_id: null
                    });
                }
                response.status = 'OK';
                response.message = sails.__('Success');
                return res.send(response);
            }
            response.message = sails.__('Unable to delete cart item');
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
