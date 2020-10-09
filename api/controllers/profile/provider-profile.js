module.exports = async function providerProfile(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    if (typeof req.param('email') == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var providerPacket = {
        email: req.param('email').toLowerCase()
    };

    try {
        const userFound = await User.find({
            where: { email: email }
        }).limit(1);
        if (typeof userFound[0] !== undefined && userFound[0]) {
            await User.update({
                email: providerPacket.email
            }).set({
                name: providerPacket.name,
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    userFound[0].ipAddress,
                    req.options.action
                )
            });
            await Profile.update({
                created_by: userFound.id
            }).set({
                business_name: providerPacket.business_name,
                established_on: providerPacket.established_on,
                description: providerPacket.description,
                tagline: providerPacket.tagline,
                type_id: providerPacket.type
            });
            response.status = 'OK';
            response.message = sails.__('Details saved successfully');
            response.data.step = null;
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
