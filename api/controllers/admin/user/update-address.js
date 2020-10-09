module.exports = async function addressUpdate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    if (
        typeof req.param('name') == 'undefined' ||
        typeof req.param('phone') == 'undefined' ||
        typeof req.param('address_line1') == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    var userAddress = {
        name: req.param('name'),
        phone: req.param('phone'),
        address_line1: req.param('address_line1'),
        city: req.param('city'),
        state: req.param('state'),
        country: req.param('country'),
        zipcode: req.param('pincode'),
        addressId: req.param('addressId')
    };
    try {
        await UserAddress.update({
            id: userAddress.addressId
        }).set({
            name: await User.getCapital(userAddress.name),
            status: sails.config.constants.STATUS_ACTIVE,
            phone: userAddress.phone,
            zipcode: userAddress.zipcode,
            city: userAddress.city,
            state: userAddress.state,
            country: userAddress.country,
            address_line1: userAddress.address_line1
        });

        response.status = 'OK';
        response.message = sails.__('Address updated successfully');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
