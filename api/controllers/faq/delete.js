module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const faqId = req.param('faqId');

    if (typeof providerId == 'undefined' || typeof faqId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var faq = await Faq.find({
            id: faqId,
            created_by: providerId
        }).limit(1);
        if (faq && faq.length > 0) {
            await Faq.destroy({
                id: faqId
            });
            response.status = 'OK';
            response.message = sails.__('FAQ deleted successfully');
            return res.send(response);
        }
        response.message = sails.__('Unable to delete FAQ');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
