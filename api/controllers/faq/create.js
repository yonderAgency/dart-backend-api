module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const question = req.param('question');
    const answer = req.param('answer');
    const providerServiceId = req.param('provider_service_id');

    if (
        typeof providerId == 'undefined' ||
        typeof question == 'undefined' ||
        typeof answer == 'undefined' ||
        typeof providerServiceId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var faq = {};
        faq.question = question;
        faq.provider_service_id = providerServiceId;
        faq.answer = answer;
        faq.created_by = providerId;

        Faq.create(faq, function(err, pack) {
            if (err) {
                sails.sentry.captureException(err);
                response.message = sails.__(
                    'We are very sorry, it is taking more than expected time. Please try again!'
                );
                return res.send(response);
            }
            response.status = 'OK';
            response.message = sails.__('Faq added successfully');
            return res.send(response);
        });
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
