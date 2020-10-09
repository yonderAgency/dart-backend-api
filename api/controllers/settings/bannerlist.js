module.exports = async function bannerlist(req, res) {
    var response = { status: 'NOK', message: '', data: []};

    try {
        let models = [];
        let banners = await Banners.find();

        if (banners && banners.length > 0) {
            for (x in banners) {
                models.push(await Banners.getJson(banners[x]));
            }
        }
        response.data = models;
        response.status = 'OK';
        response.message = sails.__('Success');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
