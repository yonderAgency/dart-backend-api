module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var videoUrl = await ProviderServiceVideo.find({
            id: id
        }).limit(1);
        if (providerService.length > 0) {
            const detail = await ProviderServiceVideo.getJson(videoUrl[0]);
            response.message = sails.__('Success');
            response.status = 'OK';
            response.data = detail;
            return res.json(response);
        } else {
            response.message = sails.__('No video found');
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
