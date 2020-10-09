module.exports = async function checkPhoneOtp(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var email = req.param('email');
    const otp = req.param('otp');
    const checkVerify = req.param('is_email_verify');
    const playerId = req.param('playerId');

    if (typeof checkVerify === undefined) {
        checkVerify = 0;
    }

    if (typeof otp == 'undefined' || typeof email == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    } else {
        email = email.toLowerCase();
    }

    try {
        const userFound = await User.find({
            where: { email: email, otp: otp }
        }).limit(1);
        if (typeof userFound[0] !== undefined && userFound[0]) {
            await User.update({
                email: email,
                otp: otp
            }).set({
                is_phone_verified: true
            });
            let websiteImages = await Api.getWebsiteImage();
            await sails.hooks.email.send(
                'banking',
                {
                    name: userFound[0].name,
                    image: websiteImages
                },
                {
                    to: userFound[0].email,
                    subject:
                        'Welcome to ' + sails.config.dynamics.APPLICATION_NAME
                },
                async function(err) {
                    if (err) {
                      
                        sails.sentry.captureException(err);
                    }
                    response.status = 'OK';
                    response.message = sails.__('Phone OTP verified');
                    response.data.token = await User.addUserToken(
                        userFound[0],
                        playerId
                    );
                    var completionPackage = await User.getProviderCompletion(
                        userFound[0]
                    );
                    response.data.step = completionPackage.step;
                    response.data.showContent = completionPackage.showContent;
                    return res.json(response);
                }
            );
        } else {
            response.message = sails.__('Please enter valid OTP');
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
