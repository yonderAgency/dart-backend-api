const api = require('../../models/Api.js');
module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var is_default = req.param('is_default');

    const userId = await req.authUser.id;
    const name = req.param('name');
    const city = req.param('city');
    const email = req.param('email');
    const phone = req.param('phone');
    const state = req.param('state');
    const addressId = req.param('id');
    const country = req.param('country');
    const latitude = req.param('latitude');
    const longitude = req.param('longitude');
    const zipcode = req.param('zipcode');
    const type_id = req.param('type_id');
    const address_line1 = req.param('address_line1');
    const address_line2 = req.param('address_line2');

    if (typeof addressId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var addresses = await UserAddress.find({
            created_by: userId,
            id: { '!=': addressId }
        });
        if (addresses.length > 0) {
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
        var address = await UserAddress.find({
            created_by: userId,
            id: addressId
        });
        if (userId && address && addressId) {
            let coordiantes = {
                latitude: api.checkIncomingAttribute(
                    latitude,
                    address[0].latitude
                ),
                longitude: api.checkIncomingAttribute(
                    longitude,
                    address[0].longitude
                )
            };
            await UserAddress.update({
                id: addressId,
                created_by: userId
            }).set({
                is_default: is_default,
                email: api.checkIncomingAttribute(email, address[0].email),
                name: api.checkIncomingAttribute(name, address[0].name),
                phone: api.checkIncomingAttribute(phone, address[0].phone),
                city: api.checkIncomingAttribute(city, address[0].city),
                state: api.checkIncomingAttribute(state, address[0].state),
                type_id: api.checkIncomingAttribute(
                    type_id,
                    address[0].type_id
                ),
                address_line1: api.checkIncomingAttribute(
                    address_line1,
                    address[0].address_line1
                ),
                address_line2: api.checkIncomingAttribute(
                    address_line2,
                    address[0].address_line2
                ),
                country: api.checkIncomingAttribute(
                    country,
                    address[0].country
                ),
                latitude: api.checkIncomingAttribute(
                    latitude,
                    address[0].latitude
                ),
                longitude: api.checkIncomingAttribute(
                    longitude,
                    address[0].longitude
                ),
                zipcode: api.checkIncomingAttribute(
                    zipcode,
                    address[0].zipcode
                ),
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            });
            response.status = 'OK';
            response.message = sails.__('Success');

            return res.json(response);
        } else {
            response.message = sails.__('No logged in user found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
