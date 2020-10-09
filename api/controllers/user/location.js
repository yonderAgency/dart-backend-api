module.exports = async function status(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const user = req.authUser;
    const latitude = req.param('latitude');
    const longitude = req.param('longitude');

    if (typeof latitude == 'undefined' || typeof longitude == 'undefined') {
        latitude = req.location.latitude;
        longitude = req.location.longitude;
    }

    try {
        await User.update({
            id: user.id
        }).set({
            latitude: latitude,
            longitude: longitude,
            location: {
                type: 'Point',
                coordinates: [req.location.longitude, req.location.latitude]
            },
            ipAddress: User.pushIpData(
                Api.filterIp(req.ip),
                user.ipAddress,
                req.options.action
            )
        });
        response.status = 'OK';
        response.message = sails.__('Success');
        response.data = {
            latitude: latitude,
            longitude: longitude
        };
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
