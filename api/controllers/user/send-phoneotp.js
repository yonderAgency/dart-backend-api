module.exports = async function sendphoneotp(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var email = req.param('email');
    const phone = req.param('phone');

    if (typeof email == 'undefined' || typeof phone == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    } else {
        email = req.param('email').toLowerCase();
    }

    try {
        if (phone.length == 10 && !isNaN(phone)) {
            existingUser = await User.find({
                email: email
            }).limit(1);

            if (existingUser && existingUser.length > 0) {
                await User.update({
                    email: email
                }).set({
                    phone: phone
                });
                let updatedUser = await User.find({
                    email: email
                }).limit(1);
                if (updatedUser && updatedUser.length > 0) {
                    var completionPackage = await User.getProviderCompletion(
                        updatedUser[0]
                    );
                    response.data.step = completionPackage.step;
                    response.data.showContent = completionPackage.showContent;
                    response.status = 'OK';
                    response.message = sails.__(
                        'OTP Sent to your phone number'
                    );
                    return res.json(response);
                } else {
                    response.message = sails.__('Unable to update user');
                    return res.json(response);
                }
            } else {
                response.message = sails.__('User not found');
                return res.json(response);
            }
        } else {
            response.message = sails.__('Phone number is not valid');
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
