module.exports = async function services(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = req.param('providerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var services = await ProviderService.find({
            created_by: userId
        });
        if (services) {
            json = [];
            for (x in services) {
                json.push(await ProviderService.getJson(services[x], true));
            }
            if (json.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = json;
            } else {
                response.message = sails.__('No service found');
            }
            return res.json(response);
        } else {
            response.message = sails.__('No service found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
