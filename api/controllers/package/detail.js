module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const packageId = req.param('packageId');

    if (typeof providerId == 'undefined' || typeof packageId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var package = await ProviderServiceAddon.find({
            created_by: providerId,
            id: packageId
        }).limit(1);
        if (package && package.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await ProviderServiceAddon.getJson(package[0]);
            return res.json(response);
        } else {
            response.message = sails.__('No package found');
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
