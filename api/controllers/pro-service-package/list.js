module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    const providerId = req.authUser.id;
    const groupId = req.param('providerServiceGroupId');

    if (
        typeof providerId == 'undefined' ||
        typeof groupId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var serviceAddon = await ProviderServiceAddonGroup.find({
            created_by: providerId,
            id: groupId
        }).limit(1);
        if (serviceAddon.length > 0) {
            var list = await ProviderServiceAddonGroup.getJson(
                serviceAddon[0],
                true
            );
            response.status = 'OK';
            response.message = sails.__('Package found successfully');
            response.data = list;
            return res.json(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No package found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
