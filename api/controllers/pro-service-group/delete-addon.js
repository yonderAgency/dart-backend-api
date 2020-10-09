module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const id = req.param('id');
    const status = req.param('status');

    if (id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        await ProviderServiceAddon.update(
            { id: id, created_by: req.authUser.id },
            { status: status }
        );
        const updated = await ProviderServiceAddon.find({
            id: id,
            created_by: req.authUser.id
        }).limit(1);
        response.status = 'OK';
        response.data = updated[0];
        response.message = sails.__('Addon status changed successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
