module.exports = async function add(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        var userArray = [];
        var users = await User.find()
            .populate('tokens')
            .limit(20);
        if (users) {
            users.forEach(async function(user, index) {
                userArray.push(await User.getJson(user));
            });
            response.status = 'OK';
            response.data = userArray;
            return res.json(response);
        } else {
            response.message = sails.__('No user found');
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
