module.exports = async function makeFeature(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var userId = req.param('id');

    if (typeof userId !== 'undefined') {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var provider = await User.find({
            id: userId
        }).limit(1);

        if (provider[0]) {
            await ProviderProfile.update({ created_by: userId }).set({
                is_featured: 1
            });
            response.status = 'OK';
            response.message = sails.__('Provider is marked featured');
        } else {
            response.message = sails.__('No provider found');
        }

        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
