module.exports = async function alldata(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var providerId = req.authUser.id;
    var providerServiceId = req.param('serviceId');

    if (typeof providerServiceId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (providerId && providerServiceId) {
            var providerService = await ProviderService.find({
                created_by: providerId,
                id: providerServiceId
            }).limit(1);
            if (providerService.length > 0) {
                var servicepacket = await ProviderService.getCompleteJson(
                    providerService[0]
                );
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = servicepacket;
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
