module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    try {
        var services = await Service.find({
            status: sails.config.constants.STATUS_ACTIVE,
            deleted_at: null
        });
        if (services) {
            const allServices = await Service.getAll(services, true);
            if (allServices.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = allServices;
                return res.json(response);
            }
        }
        response.message = sails.__('No service found');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
