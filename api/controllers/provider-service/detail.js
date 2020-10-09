module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const proServiceId = req.param('proServiceId');

    if (typeof proServiceId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (proServiceId) {
            var providerService = await ProviderService.find({
                id: proServiceId
            }).limit(1);
            if (providerService.length > 0) {
                const detail = await ProviderService.getCompleteJson(
                    providerService[0],
                    true
                );
                response.message = sails.__('Success');
                response.status = 'OK';
                response.data = detail;
                return res.json(response);
            } else {
                response.message = sails.__('No service found');
                return res.json(response);
            }
        } else {
            response.message = sails.__('No service found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
