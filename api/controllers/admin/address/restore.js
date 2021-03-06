module.exports = async function restore(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var address = await UserAddress.find({
            id: id,
            deleted_at: { '!=': null }
        }).limit(1);
        if (address.length > 0) {
            await UserAddress.update({
                id: id
            }).set({
                deleted_at: null
            });
            response.status = 'OK';
            response.message = sails.__('Address restored');
            return res.json(response);
        } else {
            response.message = sails.__('Address not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
