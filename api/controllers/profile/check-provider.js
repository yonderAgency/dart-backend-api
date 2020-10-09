module.exports = async function checkProvider(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const user = req.authUser;
    if (user) {
        await User.update({
            email: user.email
        }).set({
            location: {
                type: 'Point',
                coordinates: [req.location.longitude, req.location.latitude]
            }
        });

        var userDetail = await User.getMyDetail(user);
        userDetail['location'] = req.location;
        response.status = 'OK';
        response.message = sails.__('Success');
        var completionPackage = await User.getProviderCompletion(user);
        response.data.detail = userDetail;
        response.data.step = completionPackage.step;

        return res.json(response);
    }
    response.message = sails.__('Invalid request');
    return res.json(response);
};
