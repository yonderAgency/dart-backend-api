module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const serviceId = req.param('providerServiceId');
    const url = req.param('url');
    const createdBy = req.authUser.id;

    if (typeof serviceId == 'undefined' || typeof url == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var fetch = await ProviderServiceVideo.find({
            provider_service_id: serviceId
        });
        if (fetch && fetch.length > 0) {
            if (fetch[0].url.indexOf(url) != -1) {
                response.message = sails.__('Video already exists');
                return res.send(response);
            } else {
                if (fetch[0].url.length >= sails.config.dynamics.MEDIA_COUNT) {
                    response.message = sails.__('Videos limit reached');
                    return res.send(response);
                }
                old = fetch[0].url;
                old.push(url);
                await ProviderServiceVideo.update({
                    id: fetch[0].id
                }).set({
                    url: old
                });
                response.status = 'OK';
                response.message = sails.__('Video added successfully');
                return res.send(response);
            }
        } else {
            await ProviderServiceVideo.create({
                provider_service_id: serviceId,
                url: [url],
                created_by: createdBy
            });
            response.status = 'OK';
            response.message = sails.__('Video added successfully');
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
