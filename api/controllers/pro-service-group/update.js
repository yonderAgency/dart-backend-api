module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const providerId = req.authUser.id;
    const id = req.param('id');
    const name = req.param('name');
    const quantity = req.param('quantity');
    const required = req.param('required');
    const provider_service_id = req.param('provider_service_id');
    const description = req.param('description');
    const status = req.param('status');

    if (
        typeof req.param('id') === 'undefined' ||
        typeof req.param('name') === 'undefined' ||
        typeof req.param('quantity') === 'undefined' ||
        typeof req.param('required') === 'undefined' ||
        typeof req.param('provider_service_id') === 'undefined' ||
        typeof req.param('description') === 'undefined' ||
        typeof req.param('status') === 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    if (
        req.param('required') === true &&
        parseInt(req.param('quantity')) <= 0
    ) {
        response.message = sails.__(
            'Quantity cannot be 0 when required is true'
        );
        return res.send(response);
    }

    try {
        var addonCount = await ProviderServiceAddon.count({
            provider_service_group_id: id,
            created_by: providerId
        });
        if(req.param('quantity') > addonCount) {
            response.message = sails.__(
                'Quantity cannot be more than actually added addons'
            );
            return res.send(response);
        }
        var count = await ProviderServiceAddonGroup.count({
            id: id,
            created_by: providerId
        });
        if (count > 0) {
            await ProviderServiceAddonGroup.update({
                id: id,
                created_by: providerId
            }).set({
                name: name,
                quantity: quantity,
                required: required,
                provider_service_id: provider_service_id,
                description: description,
                status: status
            });
            response.status = 'OK';
            response.message = sails.__('Package group updated successfully');
            return res.send(response);
        } else {
            response.message = sails.__('Package group not found');
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
