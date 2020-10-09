module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    const providerServiceId = req.param('providerServiceId');
    const createdBy = req.authUser.id;

    if (typeof providerServiceId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const providerServiceList = [];
        var providerServicesVideo = await ProviderServiceVideo.find({
            provider_service_id: providerServiceId,
            created_by: createdBy
        });
        if (providerServicesVideo.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await ProviderServiceVideo.getSimpleJson(
                providerServicesVideo[0]
            );
            return res.json(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No video found');
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
