module.exports = async function get(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var user = req.authUser;

    try {
        const helps = await Helpdesk.find({
            created_by: user.id
        });
        var json = [];
        if (helps.length > 0) {
            for (x in helps) {
                json.push(await Helpdesk.getJson(helps[x]));
            }
        }
        if (json.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = {
                categoryData: sails.config.dynamics.HELPDESK_MESSAGES,
                list: json
            };
            return res.json(response);
        } else {
            response.data = {
                categoryData: sails.config.dynamics.HELPDESK_MESSAGES,
                list: []
            };
            response.status = 'OK';
            response.message = sails.__('No query found');
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
