module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const name = req.param('name');
    const price = req.param('price');
    let costPrice = req.param('costPrice');
    const description = req.param('description');
    const addOnCategoryId = req.param('addOnCategoryId');

    if (
        name == 'undefined' ||
        price == 'undefined' ||
        costPrice == 'undefined' ||
        description == 'undefined' ||
        addOnCategoryId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    if(costPrice === '' || costPrice === 0) {
        costPrice = price;
    }

    try {
        const packet = {
            name: name,
            price: price,
            cost_price: costPrice,
            description: description,
            provider_service_group_id: addOnCategoryId,
            created_by: req.authUser.id
        };
        await ProviderServiceAddon.create(packet);
        const updated = await ProviderServiceAddon.find({
            provider_service_group_id: addOnCategoryId,
            name: name,
            created_by: req.authUser.id
        });
        response.status = 'OK';
        response.data = updated[0];
        response.message = sails.__('Addon added successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
