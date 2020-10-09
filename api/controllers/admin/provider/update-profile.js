const api = require('../../../models/Api.js');

const handleResponse = async (
    userPacket,
    providerPacket,
    user,
    filename = ''
) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        if (user.id) {
            User.update({
                id: user.id
            })
                .set(userPacket)
                .exec(function(err, result) {
                    if (err) {
                        temp.message = err.details;
                        return resolve(temp);
                    }
                    if (filename != '') {
                        providerPacket.logo = filename;
                        ProviderProfile.update({
                            created_by: user.id
                        })
                            .set(providerPacket)
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
                        ProviderProfile.update({
                            created_by: user.id
                        })
                            .set(providerPacket)
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
                    }
                });
        } else {
            temp.message = sails.__('Unable to update user details');
            return resolve(temp);
        }
    });
};

module.exports = async function updateProfile(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var file = req.param('image');
    const providerId = req.param('providerId');

    try {
        const user = await User.find({
            id: providerId
        }).limit(1);
        var fileName = '';
        if (user) {
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
                        user.name
                    ),
                    email: api.checkIncomingAttribute(
                        req.param('email'),
                        user.email
                    ),
                    phone: api.checkIncomingAttribute(
                        req.param('phone'),
                        user.phone
                    ),
                    admin_cut: api.checkIncomingAttribute(
                        req.param('adminCut'),
                        user.admin_cut
                    ),
                    is_deleted: api.checkIncomingAttribute(
                        req.param('is_deleted'),
                        user.is_deleted
                    ),
                    is_blocked: api.checkIncomingAttribute(
                        req.param('is_blocked'),
                        user.is_blocked
                    ),
                    under_review: api.checkIncomingAttribute(
                        req.param('under_review'),
                        user.under_review
                    ),
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        user.ipAddress,
                        req.options.action
                    )
                };
                var providerProfile = await ProviderProfile.find({
                    created_by: user.id
                }).limit(1);
                var providerPacket = {};
                if (providerProfile && providerProfile.length > 0) {
                    providerPacket = {
                        description: api.checkIncomingAttribute(
                            req.param('bio'),
                            providerProfile[0].description
                        ),
                        established_on: api.checkIncomingAttribute(
                            req.param('establishedOn'),
                            providerProfile[0].established_on
                        ),
                        business_name: api.checkIncomingAttribute(
                            req.param('businessName'),
                            providerProfile[0].business_name
                        ),
                        admin_cut: api.checkIncomingAttribute(
                            req.param('adminCut'),
                            user.admin_cut
                        ),
                        is_featured: api.checkIncomingAttribute(
                            req.param('isFeatured'),
                            providerProfile[0].is_featured
                        ),
                        admin_cut: api.checkIncomingAttribute(
                            req.param('adminCut'),
                            providerProfile[0].admin_cut
                        )
                    };
                }
                const tempResponse = await handleResponse(
                    userPacket,
                    providerPacket,
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
                        user.name
                    ),
                    email: api.checkIncomingAttribute(
                        req.param('email'),
                        user.email
                    ),
                    phone: api.checkIncomingAttribute(
                        req.param('phone'),
                        user.phone
                    ),
                    is_deleted: api.checkIncomingAttribute(
                        req.param('is_deleted'),
                        user.is_deleted
                    ),
                    is_blocked: api.checkIncomingAttribute(
                        req.param('is_blocked'),
                        user.is_blocked
                    ),
                    under_review: api.checkIncomingAttribute(
                        req.param('under_review'),
                        user.under_review
                    )
                };
                var providerProfile = await ProviderProfile.find({
                    created_by: user.id
                }).limit(1);
                var providerPacket = {};
                if (providerProfile && providerProfile.length > 0) {
                    var sampleDate = null;
                    if (
                        typeof req.param('establishedOn') != 'undefined' &&
                        req.param('establishedOn') != null
                    ) {
                        sampleDate = new Date(req.param('establishedOn'));
                        sampleDate = sampleDate.getTime();
                    }
                    providerPacket = {
                        description: api.checkIncomingAttribute(
                            req.param('bio'),
                            providerProfile[0].description
                        ),
                        established_on: api.checkIncomingAttribute(
                            sampleDate,
                            providerProfile[0].established_on
                        ),
                        business_name: api.checkIncomingAttribute(
                            req.param('businessName'),
                            providerProfile[0].business_name
                        ),
                        is_featured: api.checkIncomingAttribute(
                            req.param('isFeatured'),
                            providerProfile[0].is_featured
                        ),
                        admin_cut: api.checkIncomingAttribute(
                            req.param('adminCut'),
                            providerProfile[0].admin_cut
                        )
                    };
                }
                const tempResponse = await handleResponse(
                    userPacket,
                    providerPacket,
                    user[0]
                );
                if (tempResponse.status == 'OK') {
                    response.status = 'OK';
                    response.message = tempResponse.message;
                    return res.send(response);
                }
                response.message = tempResponse.message;
                return res.send(response);
            }
        } else {
            response.message == sails.__('Invalid request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
