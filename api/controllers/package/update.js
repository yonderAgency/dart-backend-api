module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const packageId = req.param('packageId');
    const name = req.param('name');
    const description = req.param('description');
    const costPrice = req.param('costPrice');
    const price = req.param('price');

    if (
        typeof packageId == 'undefined' ||
        typeof name == 'undefined' ||
        typeof description == 'undefined' ||
        typeof price == 'undefined' ||
        typeof costPrice == 'undefined' ||
        typeof providerId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var package = await ProviderServiceAddon.find({
            created_by: providerId,
            id: packageId
        }).limit(1);
        if (package && package.length > 0) {
            await ProviderServiceAddon.update({
                id: packageId,
                created_by: providerId
            }).set({
                name: Api.checkIncomingAttribute(name, package[0].name),
                description: Api.checkIncomingAttribute(
                    description,
                    package[0].description
                ),
                costPrice: Api.checkIncomingAttribute(
                    costPrice,
                    package[0].costPrice
                ),
                price: Api.checkIncomingAttribute(price, package[0].price)
            });
            response.status = 'OK';
            response.message = sails.__('Package updated successfully');
            return res.send(response);
        } else {
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
