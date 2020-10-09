module.exports = async function providerService(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var serviceId = req.param('providerServiceId');

    if (typeof serviceId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var services = await ProviderService.find({
            id: serviceId
        }).limit(1);
        if (services && services.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await ProviderService.getCompleteJson(services[0]);
            return res.json(response);
        } else {
            response.message = sails.__('No service found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
