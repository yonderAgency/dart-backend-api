module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const role = req.param('role');

    if (typeof role == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var users = await User.find({
            role: role,
            status: sails.config.constants.STATUS_ACTIVE,
            is_deleted: sails.config.constants.IS_ACTIVE,
            is_blocked: sails.config.constants.IS_UNBLOCKED
        });

        var addresses = [];
        if (users && users.length > 0) {
            for (x in users) {
                var tempAddresses = await UserAddress.getAddressJson(
                    users[x],
                    addresses
                );
                if (tempAddresses && tempAddresses.length > 0) {
                    for (x in tempAddresses) {
                        addresses.push(tempAddresses[x]);
                    }
                }
            }
        }
        response.data = addresses;
        response.status = 'OK';
        response.message = sails.__('Success');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
