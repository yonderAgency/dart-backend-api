module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var costPrice = req.param('price');
    const name = req.param('name');
    const groupId = req.param('providerServiceGroupId');
    const providerServiceId = req.param('providerServiceId');
    const price = req.param('price');
    const description = req.param('description');

    if (
        name == 'undefined' ||
        groupId == 'undefined' ||
        price == 'undefined' ||
        description == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    if (
        req.param('costPrice') &&
        typeof req.param('costPrice') != 'undefined' &&
        req.param('costPrice') != ''
    ) {
        costPrice = req.param('costPrice');
    }

    if (Number(price) > Number(costPrice)) {
        response.message = sails.__(
            'Cost price must be greator than selling price'
        );
        return res.send(response);
    }

    var package = {
        name: name,
        provider_service_group_id: groupId,
        price: price,
        cost_price: costPrice,
        description: description,
        created_by: req.authUser.id
    };

    try {
        await ProviderServiceAddon.create(package);
        const allAddons = await ProviderServiceAddonGroup.find({
            provider_service_id: providerServiceId,
            created_by: req.authUser.id
        });
        const data = [];
        if (allAddons && allAddons.length > 0) {
            for (x in allAddons) {
                data.push(
                    await ProviderServiceAddonGroup.getJson(allAddons[x], true)
                );
            }
        }
        response.data = data;
        response.status = 'OK';
        response.message = sails.__('Service package created successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
