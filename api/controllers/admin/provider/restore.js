module.exports = async function restore(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var user = await User.find({
            id: id,
            deleted_at: { '!=': null }
        }).limit(1);
        if (user.length > 0) {
            await User.update({
                id: id
            }).set({
                deleted_at: null,
                is_deleted: sails.config.constants.IS_ACTIVE,
                ipAddress: User.pushIpData(
                    Api.filterIp(req.ip),
                    user[0].ipAddress,
                    req.options.action
                )
            });
            response.status = 'OK';
            response.message = sails.__('User restored');
            return res.json(response);
        } else {
            response.message = sails.__('User not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
