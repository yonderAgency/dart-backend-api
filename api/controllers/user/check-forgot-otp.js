module.exports = async function checkForgotOtp(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var checkVerify = req.param('is_email_verify');
    var email = req.param('email');

    const otp = req.param('otp');
    const playerId = req.param('playerId');

    if (typeof checkVerify == 'undefined') {
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
            let activationKey = await Api.generatedCode(15);
            await User.update({ email: email }).set({
                is_email_verified: 1,
                activation_key: activationKey,
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    userFound[0].ipAddress,
                    req.options.action
                )
            });
            if (
                playerId &&
                typeof playerId != 'undefined' &&
                playerId != null
            ) {
                response.data.token = await User.addUserToken(
                    userFound[0],
                    playerId
                );
            }
            response.status = 'OK';
            response.data.token = activationKey;
            response.message = sails.__('Success');
            return res.json(response);
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
