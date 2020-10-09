module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    const providerId = req.param('providerId');
    const providerServiceId = req.param('providerServiceId');

    if (
        typeof providerId == 'undefined' ||
        typeof providerServiceId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var serviceAddon = await ProviderServiceAddonGroup.find({
            created_by: providerId,
            provider_service_id: providerServiceId
        });
        if (serviceAddon.length > 0) {
            var list = [];
            for (x in serviceAddon) {
                list.push(
                    await ProviderServiceAddonGroup.getJson(
                        serviceAddon[x],
                        true
                    )
                );
            }
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
