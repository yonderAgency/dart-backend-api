module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const id = req.param('id');
    const name = req.param('name');
    const price = req.param('price');
    const costPrice = req.param('costPrice');
    const description = req.param('description');

    if (
        id == 'undefined' ||
        name == 'undefined' ||
        price == 'undefined' ||
        costPrice == 'undefined' ||
        description == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const packet = {
            name: name,
            price: price,
            cost_price: costPrice,
            description: description,
            created_by: req.authUser.id
        };
        await ProviderServiceAddon.update({ id: id }, packet);
        const updated = await ProviderServiceAddon.find({ id: id });
        response.status = 'OK';
        response.data = updated[0];
        response.message = sails.__('Addon updated successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
