module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const serviceList = [];
    const providerId = req.param('id');

    if (typeof providerId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var providerServices = await ProviderService.find({
            created_by: providerId,
            status: sails.config.constants.STATUS_ACTIVE,
            is_deleted: sails.config.constants.IS_ACTIVE
        });
        if (providerServices.length > 0) {
            for (x in providerServices) {
                var serviceModel = await Service.find({
                    id: providerServices[x].service_id,
                    status: sails.config.constants.STATUS_ACTIVE,
                    deleted_at: null
                }).limit(1);
                if (serviceModel && serviceModel.length > 0) {
                    serviceList.push(
                        await Service.getJson(
                            serviceModel[0],
                            providerServices[x]
                        )
                    );
                }
            }
            if (serviceList.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = serviceList;
                return res.json(response);
            } else {
                response.message = sails.__('No service found');
                return res.send(response);
            }
        } else {
            response.message = sails.__('No service found');
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
