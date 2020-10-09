module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const user = req.authUser;
    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    
    try {
        const helps = await Helpdesk.find({
            created_by: user.id,
            id: id
        });
        if (helps.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = await Helpdesk.getJson(helps[0], true);
            return res.json(response);
        } else {
            response.status = 'NOK';
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
