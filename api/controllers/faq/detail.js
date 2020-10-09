module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const faqId = req.param('faqId');

    if (typeof providerId == 'undefined' || typeof faqId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var faq = await Faq.find({
            created_by: providerId,
            id: faqId
        }).limit(1);
        if (faq && faq.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Faq.getJson(faq[0]);
            return res.json(response);
        } else {
            response.message = sails.__('No faq found');
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
