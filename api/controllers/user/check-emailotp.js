const moment = require('moment');

module.exports = async function checkEmailOtp(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const otp = req.param('otp');
    let email = req.param('email');
    let playerId = req.param('playerId');
    let checkVerify = req.param('is_email_verify');

    if (typeof checkVerify == 'undefined') {
        checkVerify = 0;
    }

    if (typeof email == 'undefined' || typeof otp == 'undefined') {
        checkVerify = 0;
    } else {
        email = email.toLowerCase();
    }

    try {
        const userFound = await User.find({
            where: { email: email, otp: otp }
        }).limit(1);
        if (typeof userFound !== 'undefined' && userFound.length > 0) {
            await User.update({
                email: email,
                otp: otp
            }).set({
                otp: '',
                is_email_verified: true,
                is_phone_verified: true,
                updated_at: moment().valueOf(),
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    userFound[0].ipAddress,
                    req.options.action
                )
            });
            response.data.token = await User.addUserToken(
                userFound[0],
                playerId
            );
            let newUser = await User.find({
                id: userFound[0].id
            }).limit(1);
            let completionPackage = await User.getProviderCompletion(
                newUser[0]
            );
            response.status = 'OK';
            response.data.step = completionPackage.step;
            response.message = sails.__('OTP verified');
            return res.send(response);
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
