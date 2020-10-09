module.exports = async function edit(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const groupId = req.param('providerServiceGroupId');
    const id = req.param('packageId');
    const name = req.param('name');
    const price = req.param('price');
    const description = req.param('description');
    const providerId = req.authUser.id;
    var costPrice = price;

    if (
        req.param('costPrice') &&
        typeof req.param('costPrice') != 'undefined' &&
        req.param('costPrice') != ''
    ) {
        costPrice = req.param('costPrice');
    }

    if (
        id == 'undefined' ||
        name == 'undefined' ||
        price == 'undefined' ||
        description == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    if (Number(price) > Number(costPrice)) {
        response.message = sails.__(
            'Cost price must be greator than selling price'
        );
        return res.send(response);
    }

    try {
        var count = await ProviderServiceAddon.count({
            id: id,
            provider_service_group_id: groupId,
            created_by: providerId
        });
        if (count > 0) {
            await ProviderServiceAddon.update({
                id: id,
                created_by: providerId
            }).set({
                name: name,
                price: price,
                description: description,
                cost_price: costPrice,
                provider_service_group_id: groupId
            });
            response.status = 'OK';
            response.message = sails.__('Service package updated successfully');
            return res.send(response);
        } else {
            response.message = sails.__('Service package not found');
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
