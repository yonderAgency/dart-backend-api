module.exports = async function contact(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const name = req.param('name');
    const email = req.param('email');
    const message = req.param('message');

    if (
        typeof name == 'undefined' ||
        typeof email == 'undefined' ||
        typeof message == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let websiteImages = await Api.getWebsiteImage();
        if (sails.config.dynamics.ADMIN_EMAIL != '') {
            sails.hooks.email.send(
                'contact',
                {
                    name: name,
                    email: email,
                    message: message,
                    image: websiteImages
                },
                {
                    to: sails.config.dynamics.ADMIN_EMAIL,
                    subject: sails.__(
                        'Help Ticket at %s',
                        sails.config.dynamics.APPLICATION_NAME
                    )
                },
                async function(err) {
                    if (err) {
                        sails.sentry.captureException(err);
                    }
                    response.status = 'OK';
                    response.message = sails.__('Success');
                    return res.send(response);
                }
            );
        } else {
            response.message = sails.__('Unable to send email');
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
