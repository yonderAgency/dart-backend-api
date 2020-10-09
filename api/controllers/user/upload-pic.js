module.exports = async function uploadpic(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const userId = req.param('id');
    const file = req.file('file');

    if (typeof userId == 'undefined' || typeof file == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var user = await User.find({
            id: userId
        }).limit(1);
        if (user && user.length > 0) {
            let filename = await Api.uploadFileImage(file, '/profile');
            if (filename != '') {
                if (user[0].role == sails.config.constants.ROLE_CUSTOMER) {
                    var exists = await CustomerProfile.find({
                        where: { created_by: userId }
                    });
                    if (exists.length > 0) {
                        await CustomerProfile.update({
                            created_by: userId
                        }).set({
                            image: filename
                        });
                    } else {
                        await CustomerProfile.create({
                            image: filename,
                            created_by: userId
                        });
                    }
                } else {
                    var exists = await ProviderProfile.find({
                        where: { created_by: userId }
                    });
                    if (exists.length > 0) {
                        await ProviderProfile.update({
                            created_by: userId
                        }).set({
                            logo: filename
                        });
                    } else {
                        await ProviderProfile.create({
                            logo: filename,
                            created_by: userId
                        });
                    }
                }
                response.status = 'OK';
                response.message = sails.__('Picture uploaded successfully');
                return res.json(response);
            } else {
                response.message = sails.__(
                    'We are very sorry, it is taking more than expected time. Please try again!'
                );
                return res.json(response);
            }
        } else {
            response.message = sails.__('Invalid request');
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
