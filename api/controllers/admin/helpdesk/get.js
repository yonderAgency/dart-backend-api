module.exports = async function get(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    try {
        const helps = await Helpdesk.find({}).sort('created_at DESC');
        var json = [];
        if (helps.length > 0) {
            for (x in helps) {
                json.push(await Helpdesk.getJson(helps[x]));
            }
        }
        if (json.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.json(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No ticket found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
