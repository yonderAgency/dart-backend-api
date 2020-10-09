module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const url = req.param('url');
    const index = req.param('index');
    const createdBy = req.authUser.id;
    const id = req.param('id');

    if (
        typeof url == 'undefined' ||
        typeof id == 'undefined' ||
        typeof index == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var createdService = await ProviderServiceVideo.find({
            provider_service_id: id,
            created_by: createdBy
        }).limit(1);
        if (createdService && createdService.length > 0) {
            let temp = createdService[0].url;
            if (typeof temp[index] != 'undefined') {
                temp[index] = url;
            }
            await ProviderServiceVideo.update({
                provider_service_id: id,
                created_by: createdBy
            }).set({
                url: temp
            });
            response.status = 'OK';
            response.message = sails.__('Video updated successfully');
            return res.json(response);
        } else {
            response.status = 'NOK';
            response.message = sails.__('Unable to update video');
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
