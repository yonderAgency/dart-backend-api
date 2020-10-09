module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const providerServiceGroupId = req.param('providerServiceGroupId');
    const name = req.param('name');
    const description = req.param('description');
    var costPrice = req.param('costPrice');
    const price = req.param('price');

    if (costPrice && typeof costPrice != 'undefined' && costPrice != '') {
    } else {
        costPrice = price;
    }

    if (
        typeof providerServiceGroupId == 'undefined' ||
        typeof name == 'undefined' ||
        typeof description == 'undefined' ||
        typeof price == 'undefined' ||
        typeof costPrice == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var existing = await ProviderServiceAddonGroup.find({
            id: providerServiceGroupId,
            created_by: createdBy
        }).limit(1);
        if (existing && existing.length > 0) {
            await ProviderServiceAddon.create({
                name: name,
                provider_service_group_id: providerServiceId,
                price: price,
                cost_price: costPrice,
                description: description,
                created_by: providerId
            });
            response.status = 'OK';
            response.message = sails.__('Addon created successfully');
            return res.send(response);
        } else {
            response.message = sails.__('Invalid addon group');
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
