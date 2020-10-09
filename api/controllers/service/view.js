module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var service = await Service.find({
            id: id
        }).limit(1);

        if (service && service.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Service.getJson(service[0], true);
            return res.json(response);
        } else {
            response.message = sails.__('No service found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
