module.exports = async function status(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');
    const status = req.param('status');

    if (typeof id == 'undefined' || typeof status == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var rating = await Rating.find({ id: id }).limit(1);
        if (rating && rating.length > 0) {
            await Rating.update({
                id: rating[0].id
            }).set({
                status: status
            });
            response.status = 'OK';
            response.message = sails.__('Status changed successfully');
            return res.json(response);
        } else {
            response.message = sails.__('Rating not found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
