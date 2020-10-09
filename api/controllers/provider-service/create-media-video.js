module.exports = async function createMediaImage(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const urls = req.param('urls');
    const createdId = req.authUser.id;
    const serviceId = req.param('serviceId');

    if (
        typeof urls == 'undefined' ||
        typeof serviceId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    try {
        if(urls.length > 0) { 
            var finalUrls = [];
            for (x in urls) {
                if (urls[x].url && urls[x].url != '') {
                    finalUrls.push(urls[x].url);
                }
            }
            var proService = await ProviderService.find({
                service_id: serviceId,
                created_by: createdId
            }).limit(1);
            if (proService.length > 0) {
                let videoModel = await ProviderServiceVideo.find({
                    provider_service_id: proService[0].id,
                    created_by: createdId,
                    status: sails.config.constants.STATUS_ACTIVE
                }).limit(1);
                if (videoModel.length > 0) {
                    await ProviderServiceVideo.update({
                        id: videoModel[0].id,
                        created_by: createdId
                    }).set({
                        url: finalUrls
                    });
                    response.status = 'OK';
                    response.message = sails.__('Video URL uploaded successfully');
                    return res.json(response);
                } else {
                    await ProviderServiceVideo.create({
                        provider_service_id: proService[0].id,
                        created_by: createdId,
                        url: finalUrls
                    });
                    response.status = 'OK';
                    response.message = sails.__('Video URL uploaded successfully');
                    return res.json(response);
                }
            } else {
                response.error = sails.__(
                    'Cannot find selected service, please try again'
                );
                return res.json(response);
            }
        } else {
            response.error = sails.__(
                'Please add URL\'s'
            );
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
