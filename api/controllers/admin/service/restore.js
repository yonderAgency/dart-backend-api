module.exports = async function restore(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var service = await Service.find({
            id: id,
            deleted_at: { '!=': null }
        }).limit(1);
        if (service.length > 0) {
            await Service.update({
                id: id
            }).set({
                deleted_at: null
            });
            response.status = 'OK';
            response.message = sails.__('Service restored');
            return res.json(response);
        } else {
            response.message = sails.__('Service not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
