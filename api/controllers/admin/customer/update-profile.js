const api = require('../../../models/Api.js');

const handleResponse = async (userPacket, user, fileName = '') => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        User.update({
            id: user.id
        })
            .set(userPacket)
            .exec(function(err, result) {
                if (err) {
                    temp.message = err.details;
                    return resolve(temp);
                }
                if (fileName != '') {
                    CustomerProfile.update({
                        created_by: user.id
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
                                'User updated successfully'
                            );
                            return resolve(temp);
                        });
                } else {
                    temp.status = 'OK';
                    temp.message = sails.__('User updated successfully');
                    return resolve(temp);
                }
            });
    });
};

module.exports = async function updateProfile(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var file = req.param('image');
    const customerId = req.param('customerId');
    try {
        const user = await User.find({
            id: customerId
        }).limit(1);
        var fileName = '';
        if (user && user.length > 0) {
            if (file && file.length > 0) {
                var randomCode = await Api.generatedCode(32);
                const split = file.split(';')[0];
                const ext = split.match(/jpeg|png/)[0];
                const data = file.replace(/^data:image\/\w+;base64,/, '');
                var buffer = new Buffer(data, 'base64');
                if (ext) {
                    fileName = randomCode + '.' + ext;
                }
                await Api.uploadImage(
                    sails.config.appPath + '/assets/uploads/profile',
                    fileName,
                    buffer
                );
                var userPacket = {
                    name: api.checkIncomingAttribute(
                        req.param('name'),
                        user[0].name
                    ),
                    email: api.checkIncomingAttribute(
                        req.param('email'),
                        user[0].email
                    ),
                    phone: api.checkIncomingAttribute(
                        req.param('phone'),
                        user[0].phone
                    ),
                    is_deleted: api.checkIncomingAttribute(
                        req.param('is_deleted'),
                        user[0].is_deleted
                    ),
                    is_blocked: api.checkIncomingAttribute(
                        req.param('is_blocked'),
                        user[0].is_blocked
                    ),
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        user[0].ipAddress,
                        req.options.action
                    )
                };
                const tempResponse = await handleResponse(
                    userPacket,
                    user[0],
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
                var userPacket = {
                    name: api.checkIncomingAttribute(
                        req.param('name'),
                        user[0].name
                    ),
                    email: api.checkIncomingAttribute(
                        req.param('email'),
                        user[0].email
                    ),
                    phone: api.checkIncomingAttribute(
                        req.param('phone'),
                        user[0].phone
                    ),
                    is_deleted: api.checkIncomingAttribute(
                        req.param('is_deleted'),
                        user[0].is_deleted
                    ),
                    is_blocked: api.checkIncomingAttribute(
                        req.param('is_blocked'),
                        user[0].is_blocked
                    )
                };
                const tempResponse = await handleResponse(userPacket, user[0]);
                if (tempResponse.status == 'OK') {
                    response.status = 'OK';
                    response.message = tempResponse.message;
                    return res.send(response);
                }
                response.message = tempResponse.message;
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
