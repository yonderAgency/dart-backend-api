module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const helpdeskId = req.param('helpdeskId');
    
    if (typeof helpdeskId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    try {
        const helps = await Helpdesk.find({
            id: helpdeskId
        }).limit(1);
        if (helps && helps.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Helpdesk.getJson(helps[0], true);
            return res.json(response);
        }
        response.status = 'NOK';
        response.message = sails.__('Query not found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
