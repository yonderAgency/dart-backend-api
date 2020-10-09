module.exports = async function check(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var user = req.authUser;
    var locationInActive = false;

    try {
        await User.update({
            id: user.id
        }).set({
            latitude: req.location.latitude,
            longitude: req.location.longitude,
            location: {
                type: 'Point',
                coordinates: [req.location.longitude, req.location.latitude]
            }
        });

        var userDetail = await User.getJson(user);
        userDetail['location'] = req.location;
        await User.getProviderCompletion(user);
        response.status = 'OK';
        response.message = sails.__('Success');
        response.data.detail = userDetail;
        response.data.locationIn = locationInActive;
        response.data.detail.locationIn = locationInActive;
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
