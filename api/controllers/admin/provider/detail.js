module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var userId = req.param('providerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var user = await User.find({
            id: userId
        }).limit(1);
        if (user.length > 0) {
            var userDetail = await User.getMyDetail(user[0]);
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data.detail = userDetail;
            var completionPackage = await User.getProviderCompletion(user[0]);
            response.data.step = completionPackage.step;
            return res.json(response);
        } else {
            response.message = sails.__('No user found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
