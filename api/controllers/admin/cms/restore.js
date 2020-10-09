module.exports = async function restore(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var cms = await Cms.find({
            id: id
        }).limit(1);
        if (cms && cms.length > 0) {
            await Cms.update({
                id: id
            }).set({
                deleted_at: null
            });
            response.status = 'OK';
            response.message = sails.__('CMS page restored');
            return res.send(response);
        } else {
            response.message = sails.__('CMS page not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
