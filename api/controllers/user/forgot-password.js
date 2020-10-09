module.exports = async function forgotPassword(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    let generatedOtp = User.getRandomOtp(6);
    var email = req.param('email');

    if (typeof email == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    } else {
        email = email.toLowerCase();
    }

    try {
        const userFound = await User.find({
            where: { email: email }
        }).limit(1);
        if (typeof userFound !== 'undefined' && userFound.length > 0) {
            let websiteImages = await Api.getWebsiteImage();
            sails.hooks.email.send(
                'forgotpassword',
                {
                    name: userFound[0].name,
                    otp: generatedOtp,
                    image: websiteImages
                },
                {
                    to: email,
                    subject: sails.__(
                        'Forgot Password: %s',
                        sails.config.dynamics.APPLICATION_NAME
                    )
                },
                async function(err) {
                    if (err) {
                        sails.sentry.captureException(err);
                        response.message = sails.__(
                            'We are very sorry, it is taking more than expected time. Please try again!'
                        );
                        return res.send(response);
                    }
                    await User.update({
                        email: email
                    }).set({
                        otp: generatedOtp,
                        ipAddress: User.pushIpData(
                            Api.filterIp(req.ip),
                            userFound[0].ipAddress,
                            req.options.action
                        )
                    });
                    response.status = 'OK';
                    response.message = sails.__(
                        'Please check, OTP is sent to your registered email'
                    );
                    return res.json(response);
                }
            );
        } else {
            response.message = sails.__('This email does not exist');
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
