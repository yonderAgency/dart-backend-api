const handleResponse = async (id, profile, fileName = null) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        if (id) {
            User.update({
                id: id
            })
                .set(profile)
                .exec(function(err, result) {
                    if (err) {
                        temp.message = err.details;
                        return resolve(temp);
                    }
                    if (fileName != null) {
                        AdminProfile.update({
                            created_by: id
                        })
                            .set({
                                image: fileName
                            })
                            .exec(function(err, result) {
                                if (err) {
                                    temp.message = err.details;
                                    return resolve(temp);
                                }
                                temp.status = 'OK';
                                temp.message = sails.__(
                                    'Profile updated successfully'
                                );
                                return resolve(temp);
                            });
                    } else {
                        temp.status = 'OK';
                        temp.message = sails.__('Profile updated successfully');
                        return resolve(temp);
                    }
                });
        } else {
            temp.message == sails.__('Invalid request');
            return resolve(temp);
        }
    });
};

module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const admin = req.authUser;
    const name = req.param('name');
    const email = req.param('email');
    var file = req.param('image');

    if (typeof name == 'undefined' || typeof name == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var fileName = '';
        if (file && file.length > 0) {
            var randomCode = await Api.generatedCode(32);
            const split = file.split(';')[0];
            const ext = split.match(/jpeg|png/)[0];
            if (ext) {
                fileName = randomCode + '.' + ext;
            }
            const data = file.replace(/^data:image\/\w+;base64,/, '');
            var buffer = new Buffer(data, 'base64');
            await Api.uploadImage(
                sails.config.appPath + '/assets/uploads/profile',
                fileName,
                buffer
            );
            var profile = {
                name: name,
                email: email,
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    req.authUser.ipAddress,
                    req.options.action
                )
            };
            const tempResponse = await handleResponse(
                admin.id,
                profile,
                fileName
            );
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            var profile = {
                name: name,
                email: email
            };
            const tempResponse = await handleResponse(admin.id, profile);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
