const faqJson = require('../../models/Faq.js');
module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const providerId = req.param('providerId');
    const proServiceId = req.param('proServiceId');

    if (
        typeof providerId == 'undefined' ||
        typeof proServiceId == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const faqList = [];
        if (providerId) {
            var faqs = await Faq.find({
                created_by: providerId,
                provider_service_id: proServiceId
            });
            if (faqs.length > 0) {
                for (x in faqs) {
                    faqList.push(await faqJson.getJson(faqs[x]));
                }
                if (faqList.length > 0) {
                    response.status = 'OK';
                    response.message = sails.__('Success');
                    response.data = faqList;
                    return res.json(response);
                }
            } else {
                response.message = sails.__('No faq found');
                return res.send(response);
            }
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
