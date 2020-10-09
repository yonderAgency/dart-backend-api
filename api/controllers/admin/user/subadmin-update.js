const api = require('../../../models/Api.js');

const handleResponse = async (userPacket, user) => {
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
                    temp.status = 'OK';
                    temp.message = sails.__('Subadmin updated successfully');
                    return resolve(temp);
                });
        } else {
            temp.message = sails.__('Unable to update user details');
            return resolve(temp);
        }
    });
};

module.exports = async function updateProfile(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const subadminId = req.param('subadminId');
    var name = req.param('name');
    var email = req.param('email');
    var subadminProfile = req.param('subadminProfile');
    var is_blocked = req.param('is_blocked');
    if (is_blocked == sails.config.constants.IS_BLOCKED) {
        var status = sails.config.constants.STATUS_INACTIVE;
    } else {
        status = sails.config.constants.STATUS_ACTIVE;
    }
    try {
        const user = await User.find({
            id: subadminId
        }).limit(1);

        if (user) {
            var userPacket = {
                name: api.checkIncomingAttribute(name, user[0].name),
                email: api.checkIncomingAttribute(email, user[0].email),
                is_blocked: api.checkIncomingAttribute(
                    is_blocked,
                    user[0].is_blocked
                ),
                status: status,
                subadminProfile: subadminProfile,

                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    user[0].ipAddress,
                    req.options.action
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
