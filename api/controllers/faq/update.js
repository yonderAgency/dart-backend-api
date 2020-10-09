module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const faqId = req.param('faqId');
    const providerId = req.authUser.id;
    const question = req.param('question');
    const answer = req.param('answer');

    if (
        typeof faqId == 'undefined' ||
        typeof providerId == 'undefined' ||
        typeof question == 'undefined' ||
        typeof answer == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    try {
        var faq = {};
        faq.question = question;
        faq.answer = answer;
        faq.created_by = providerId;

        await Faq.update({
            id: faqId
        }).set(faq);
        response.status = 'OK';
        response.message = sails.__('Faq updated successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
