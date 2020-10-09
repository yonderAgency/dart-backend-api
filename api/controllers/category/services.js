module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var catId = req.param('category_id');

    if (typeof catId === 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var services = await Service.find({
            status: sails.config.constants.STATUS_ACTIVE,
            deleted_at: null,
            category_id: catId
        });
        if (services && services.length > 0) {
            const allServices = await Service.getAll(services, true);
            if (allServices.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = allServices;
                return res.json(response);
            } else {
                response.message = sails.__('No service found');
                return res.send(response);
            }
        } else {
            response.message = sails.__('No service found');
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
