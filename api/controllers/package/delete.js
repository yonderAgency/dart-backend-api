module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const packageId = req.param('packageId');

    if (typeof providerId == 'undefined' || typeof packageId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var package = await ProviderServiceAddon.find({
            id: packageId,
            created_by: providerId
        }).limit(1);
        if (package && package.length > 0) {
            await ProviderServiceAddon.destroy({
                id: packageId
            });
            response.status = 'OK';
            response.message = sails.__('Package deleted successfully');
            return res.send(response);
        }
        response.message = sails.__('Unable to delete package');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
