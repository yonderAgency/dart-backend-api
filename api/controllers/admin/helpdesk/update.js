module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');
    const type = req.param('type');
    const status = req.param('status');

    if (
        typeof id == 'undefined' ||
        typeof type == 'undefined' ||
        typeof status == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const helps = await Helpdesk.find({
            id: id
        }).limit(1);

        if (helps && helps.length > 0) {
            await Helpdesk.update({
                id: id
            }).set({
                type_id: type,
                status: status
            });
            response.status = 'OK';
            response.message = sails.__('Help ticket updated successfully');
            return res.send(response);
        }
        response.message = sails.__('Unable to find helpdesk ticket');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
