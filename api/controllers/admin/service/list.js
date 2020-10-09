module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const category_id = req.param('categoryId');

    try {
        var services = [];
        if (typeof category_id != 'undefined' && category_id != '') {
            services = await Service.find({
                category_id: category_id
            }).sort('created_at DESC');
        } else {
            services = await Service.find({
                status: sails.config.constants.STATUS_ACTIVE,
                deleted_at: null
            }).sort('created_at DESC');
        }
        if (services) {
            const allServices = await Service.getAll(services, true);
            if (allServices.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = allServices;
                return res.json(response);
            }
        }
        response.status = 'OK';
        response.message = sails.__('No service found');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
