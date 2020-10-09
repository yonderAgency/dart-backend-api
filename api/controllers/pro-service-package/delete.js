module.exports = async function deleteservice(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var id = req.param('packageId');
    var providerId = req.authUser.id;

    if (typeof id != 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var package = await ProviderServiceAddon.find({
            id: id,
            created_by: providerId
        }).limit(1);
        if (package.length > 0) {
            var existing_booking = await BookingItem.count({
                package_id: package[0].id
            });
            if (existing_booking > 0) {
                await ProviderServiceAddon.update({
                    id: id,
                    created_by: providerId
                }).set({
                    status: sails.config.constants.STATUS_INACTIVE
                });
                response.status = 'OK';
                response.message = sails.__(
                    'Service package added successfully'
                );
            } else {
                await ProviderServiceAddon.destroy({
                    id: id,
                    created_by: providerId
                });
                response.status = 'OK';
                response.message = sails.__(
                    'Service package added successfully'
                );
            }
        } else {
            response.message = sails.__('Service package not found');
        }
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
