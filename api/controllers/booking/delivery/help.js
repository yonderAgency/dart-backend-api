module.exports = async function change(req, res) {
    var response = {
        status: 'NOK',
        message: '',
        data: {}
    };

    const issue = req.param('issue');
    const email = req.param('email');
    const requestMessage = req.param('requestMessage');
    const username = req.param('username');

    if (
        req.headers['x-auth-token'] != sails.config.constants.DELIVERY_KEY ||
        typeof issue == 'undefined' ||
        typeof email == 'undefined' ||
        typeof requestMessage == 'undefined' ||
        typeof username == 'undefined'
    ) {
        response.status = 'NOK';
        response.message = sails.__('Invalid data');
        response.data.bookingList = [];
        return res.send(response);
    }

    try {
        let websiteImages = await Api.getWebsiteImage();
        sails.hooks.email.send(
            'delivery-help',
            {
                name: username,
                image: websiteImages,
                issue: issue,
                requestMessage: requestMessage
            },
            {
                to: sails.config.dynamics.ADMIN_EMAIL,
                subject: sails.__(
                    'Delivery Help Ticket at %s',
                    sails.config.dynamics.APPLICATION_NAME
                )
            },
            async function(err) {
                if (err) {
                    sails.sentry.captureException(err);
                    response.message = sails.__('Unable to add reply');
                    return res.send(response);
                }
                response.status = 'OK';
                response.message = sails.__('Success');
                return res.send(response);
            }
        );
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
