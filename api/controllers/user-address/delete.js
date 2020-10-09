module.exports = async function deleteAddress(req, res) {
    var response = {
        status: 'NOK',
        message: '',
        data: {}
    };

    const loggedInUser = req.authUser.id;
    var id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let userAddress = await UserAddress.find({
            id: id
        });
        if (userAddress && userAddress.length > 0) {
            if (userAddress[0].is_default == 1) {
                const otherAddress = await UserAddress.find({
                    created_by: loggedInUser,
                    id: { '!=': id }
                }).limit(1);
                if (otherAddress && otherAddress.length > 0) {
                    await UserAddress.update({
                        id: otherAddress[0].id
                    }).set({
                        is_default: 1
                    });
                }
            }
            await UserAddress.update({
                id: id
            }).set({
                status: sails.config.constants.STATUS_INACTIVE
            });
            response.status = 'OK';
            response.message = sails.__('Address deleted');
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
