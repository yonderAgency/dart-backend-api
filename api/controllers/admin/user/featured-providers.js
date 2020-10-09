module.exports = async function featuredProviders(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userData = [];
    var users = [];
    try {
        users = await ProviderProfile.find({
            is_featured: 1
        }).limit(1);
        if (users.length > 0) {
            for (var user of users) {
                var provider = await User.find({
                    id: user.created_by
                });
                userData.push(await User.getJson(provider[0]));
            }
            if (userData.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = userData;
                return res.json(response);
            } else {
                response.message = sails.__('No provider found');
                return res.json(response);
            }
        } else {
            response.message = sails.__('No provider found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
