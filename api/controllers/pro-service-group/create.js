module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const name = req.param('name');
    const providerServiceId = req.param('providerServiceId');
    const quantity = req.param('quantity');
    const required = req.param('required');
    const description = req.param('description');
    const addOns = req.param('addOns');

    if (
        name == 'undefined' ||
        providerServiceId == 'undefined' ||
        quantity == 'undefined' ||
        required == 'undefined' ||
        description == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var package = {
        name: name,
        provider_service_id: providerServiceId,
        quantity: quantity,
        required: required,
        description: description,
        created_by: req.authUser.id
    };

    try {
        await ProviderServiceAddonGroup.create(package);
        const createdGroup = await ProviderServiceAddonGroup.find({
            provider_service_id: providerServiceId,
            created_by: req.authUser.id
        })
            .sort('created_at DESC')
            .limit(1);
        if (
            createdGroup &&
            createdGroup.length > 0 &&
            addOns &&
            addOns.length > 0
        ) {
            for (x in addOns) {
                const packet = {
                    name: addOns[x].name,
                    price: addOns[x].price,
                    cost_price: addOns[x].costPrice,
                    description: addOns[x].description,
                    provider_service_group_id: createdGroup[0].id,
                    created_by: package.created_by
                };
                await ProviderServiceAddon.create(packet);
            }
        }
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
        response.status = 'OK';
        response.data = data;
        response.message = sails.__('Category created successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );  
        return res.send(response);
    }
};
