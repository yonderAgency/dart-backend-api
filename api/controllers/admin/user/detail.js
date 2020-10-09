module.exports = async function check(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const userId = req.param('id');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var user = await User.find({
            where: { id: userId }
        }).limit(1);
        if (user) {
            var userDetail = await User.getJson(user[0]);
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data.detail = userDetail;
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
