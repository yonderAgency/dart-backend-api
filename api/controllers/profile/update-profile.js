const api = require('../../models/Api.js');

const handleResponse = async (filename, customerProfile) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(async function(resolve, reject) {
        if (customerProfile.id) {
            CustomerProfile.update({
                id: customerProfile.id
            })
                .set({
                    image: Api.checkIncomingAttribute(
                        filename,
                        customerProfile.image
                    )
                })
                .exec(function(err, result) {
                    if (err) {
                        temp.message = err.details;
                        return resolve(temp);
                    }
                    temp.status = 'OK';
                    temp.message = sails.__('Profile updated successfully');
                    return resolve(temp);
                });
        } else {
            temp.message = sails.__('Invalid request');
            return resolve(temp);
        }
    });
};

module.exports = async function updateProfile(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var file = req.param('image');
    const userFound = req.authUser;

    try {
        if (typeof file != 'undefined' && file && file.length > 0) {
            var randomCode = await Api.generatedCode(32);
            const split = file.split(';')[0];
            const ext = split.match(/jpeg|png/)[0];
            if (ext) {
                fileName = randomCode + '.' + ext;
            }
            const data = file.replace(/^data:image\/\w+;base64,/, '');
            const buffer = new Buffer(data, 'base64');
            await Api.uploadImage(
                sails.config.appPath + '/assets/uploads/profile',
                fileName,
                buffer
            );
            await User.update({
                id: userFound.id
            }).set({
                name: api.checkIncomingAttribute(
                    req.param('name'),
                    userFound.name
                ),
                phone: api.checkIncomingAttribute(
                    req.param('phone'),
                    userFound.phone
                ),
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    userFound.ipAddress,
                    req.options.action
                )
            });
            var customerProfile = await CustomerProfile.find({
                created_by: userFound.id
            }).limit(1);
            if (customerProfile && customerProfile.length > 0) {
                const tempResponse = await handleResponse(
                    fileName,
                    customerProfile[0]
                );
                if (tempResponse.status == 'OK') {
                    response.status = 'OK';
                    response.message = tempResponse.message;
                    return res.send(response);
                }
                response.message = tempResponse.message;
                return res.send(response);
            } else {
                response.message = sails.__('User not found');
                return res.send(response);
            }
        } else {
            await User.update({
                id: userFound.id
            }).set({
                name: api.checkIncomingAttribute(
                    req.param('name'),
                    userFound.name
                ),
                phone: api.checkIncomingAttribute(
                    req.param('phone'),
                    userFound.phone
                ),
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    userFound.ipAddress,
                    req.options.action
                )
            });
            response.status = 'OK';
            response.message = sails.__('Profile updated successfully');
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
