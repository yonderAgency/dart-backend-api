const api = require('../../models/Api.js');
const moment = require('moment');

const handleResponse = async (providerPacket, providerProfile) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(async function(resolve, reject) {
        var established = null;
        if (providerPacket.established_on) {
            established = await sails.helpers.timestamp.with({
                datetime: moment(
                    new Date(providerPacket.established_on)
                ).format('YYYY-MM-DD HH:mm:ss')
            });
        }
        if (providerProfile.id) {
            ProviderProfile.update({
                id: providerProfile.id
            })
                .set({
                    name: Api.checkIncomingAttribute(
                        providerPacket.name,
                        providerProfile.name
                    ),
                    business_name: Api.checkIncomingAttribute(
                        providerPacket.business_name,
                        providerProfile.business_name
                    ),
                    established_on: established,
                    description: Api.checkIncomingAttribute(
                        providerPacket.description,
                        providerProfile.description
                    ),
                    website: Api.checkIncomingAttribute(
                        providerPacket.website,
                        providerProfile.website
                    ),
                    type_id: providerPacket.type_id,
                    logo: Api.checkIncomingAttribute(
                        providerPacket.logo,
                        providerProfile.logo
                    ),
                    phone: Api.checkIncomingAttribute(
                        providerPacket.phone,
                        providerProfile.phone
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
    const providerPacket = {
        email: req.param('email'),
        name: req.param('name'),
        business_name: req.param('businessName'),
        established_on: req.param('establishedOn'),
        description: req.param('description'),
        type_id: req.param('typeId'),
        website: req.param('website'),
        phone: req.param('phone')
    };

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
            providerPacket.logo = fileName;
            var providerProfile = await ProviderProfile.find({
                created_by: userFound.id
            }).limit(1);
            if (providerProfile && providerProfile.length > 0) {
                const tempResponse = await handleResponse(
                    providerPacket,
                    providerProfile[0]
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
            var providerProfile = await ProviderProfile.find({
                created_by: userFound.id
            }).limit(1);
            if (providerProfile && providerProfile.length > 0) {
                const tempResponse = await handleResponse(
                    providerPacket,
                    providerProfile[0]
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
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
