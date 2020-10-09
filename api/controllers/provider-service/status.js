module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const proServiceId = req.param('proServiceId');
    const createdBy = req.authUser.id;

    if (typeof proServiceId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var createdService = await ProviderService.find({
            id: proServiceId,
            created_by: createdBy
        }).limit(1);
        if (createdService.length > 0) {
            var newStatus = sails.config.constants.STATUS_INACTIVE;
            if (
                createdService[0].status ==
                sails.config.constants.STATUS_INACTIVE
            ) {
                newStatus = sails.config.constants.STATUS_ACTIVE;
            }
            await ProviderService.update({
                id: proServiceId,
                created_by: createdBy
            }).set({
                status: newStatus
            });
            response.status = 'OK';
            response.message = sails.__('Status changed successfully');
            return res.json(response);
        } else {
            response.status = 'NOK';
            response.message = sails.__('Unable to change status');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
