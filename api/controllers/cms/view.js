module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const slug = req.param('slug');

    if (typeof slug == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var cms = await Cms.find({
            slug: slug
        }).limit(1);
        if (cms && cms.length > 0) {
            response.data = await Cms.getJson(cms[0]);
            response.status = 'OK';
            response.message = sails.__('Success');
            return res.json(response);
        }
        response.message = sails.__('CMS page not found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
