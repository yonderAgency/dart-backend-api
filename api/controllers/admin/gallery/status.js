module.exports = async function status(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var gallery = await ProviderServiceImage.find({
            id: id
        }).limit(1);
        if (gallery && gallery.length > 0) {
            var status = sails.config.constants.STATUS_ACTIVE;
            if (gallery[0].status == sails.config.constants.STATUS_ACTIVE) {
                status = sails.config.constants.STATUS_INACTIVE;
            }
            await ProviderServiceImage.update({
                id: id
            }).set({
                status: status
            });
            response.status = 'OK';
            response.message = sails.__('Updated successfully');
            return res.json(response);
        } else {
            response.message = sails.__('No such image found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
