module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const loggedInUser = req.authUser.id;
    var is_default = req.param('is_default');
    const address_line1 = req.param('address_line1');
    const address_line2 = req.param('address_line2');
    const city = req.param('city');
    const state = req.param('state');
    const country = req.param('country');
    const latitude = req.param('latitude');
    const longitude = req.param('longitude');
    const zipcode = req.param('zipcode');
    const type_id = req.param('type_id');
    const email = req.param('email');
    const name = req.param('name');
    const phone = req.param('phone');

    if (
        typeof address_line1 == 'undefined' ||
        typeof city == 'undefined' ||
        typeof state == 'undefined' ||
        typeof country == 'undefined' ||
        typeof latitude == 'undefined' ||
        typeof longitude == 'undefined' ||
        typeof zipcode == 'undefined' ||
        typeof type_id == 'undefined' ||
        typeof email == 'undefined' ||
        typeof name == 'undefined' ||
        typeof phone == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var userId = loggedInUser;
        var addresses = await UserAddress.find({
            created_by: userId,
            status: sails.config.constants.STATUS_ACTIVE
        });
        if (addresses && addresses.length > 0) {
            if (is_default == 1) {
                await UserAddress.update({
                    is_default: 1,
                    created_by: userId
                }).set({
                    is_default: 0
                });
            }
        } else {
            is_default = 1;
        }
        var addressItem = {};
        addressItem.address_line1 = address_line1;
        addressItem.address_line2 = address_line2;
        addressItem.city = city;
        addressItem.state = state;
        addressItem.country = country;
        addressItem.latitude = latitude;
        addressItem.longitude = longitude;
        addressItem.zipcode = zipcode;
        addressItem.type_id = type_id;
        addressItem.is_default = is_default;
        addressItem.email = email;
        addressItem.name = name;
        addressItem.created_by = userId;
        addressItem.phone = phone;
        addressItem.location = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        await UserAddress.create(addressItem);
        if (req.authUser.role == sails.config.constants.ROLE_PROVIDER) {
            let latestAddress = await UserAddress.find({
                created_by: userId
            })
                .sort('created_at DESC')
                .limit(1);
            if (latestAddress && latestAddress.length > 0) {
                await UserAddress.addToAllItems(
                    latestAddress[0].id,
                    req.authUser.id
                );
            }
        }
        response.status = 'OK';
        response.message = sails.__('Address added successfully');
        return res.json(response);
    } catch (err) {
       
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
