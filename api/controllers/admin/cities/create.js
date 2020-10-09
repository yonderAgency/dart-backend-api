module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedInUser = req.authUser.id;

    const city = req.param('city');
    const state = req.param('state');
    const country = req.param('country');
    const zipcode = req.param('zipcode');
    const status = req.param('status');

    if (
        typeof city == 'undefined' ||
        typeof state == 'undefined' ||
        typeof country == 'undefined' ||
        typeof status == 'undefined' ||
        typeof zipcode == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let cityPacket = await Cities.find({
            city: city,
            state: state,
            country: country,
            zipcode: zipcode
        }).limit(1);
        if (cityPacket && cityPacket.length > 0) {
            response.message = sails.__('Address already added');
            return res.send(response);
        } else {
            await Cities.create({
                city: city,
                state: state,
                country: country,
                zipcode: zipcode,
                created_by: loggedInUser
            });
            response.status = 'OK';
            response.message = sails.__('Address added successfully');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
