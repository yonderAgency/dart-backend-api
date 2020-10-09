const moment = require('moment');

module.exports = async function checkOtp(req, res) {
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
            await User.update({ email: email }).set({
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
            let newUser = await User.find({
                id: userFound[0].id
            }).limit(1);
            let completionPackage = await User.getProviderCompletion(
                newUser[0]
            );
            response.status = 'OK';
            response.data.step = completionPackage.step;
            response.message = sails.__('Success');
            response.data.token = await User.addUserToken(
                userFound[0],
                playerId
            );
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
