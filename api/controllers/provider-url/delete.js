module.exports = async function deleted(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const index = req.param('index');
    const createdBy = req.authUser.id;
    const id = req.param('id');

    if (typeof index == 'undefined' || typeof id == 'undefined') {
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
            temp.splice(index, 1);
            await ProviderServiceVideo.update({
                id: createdService[0].id,
                created_by: createdBy
            }).set({
                url: temp
            });
            response.status = 'OK';
            response.message = sails.__('Video deleted successfully');
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
