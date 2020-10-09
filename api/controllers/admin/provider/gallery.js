module.exports = async function gallery(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = req.param('providerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var images = await ProviderServiceImage.find({
            created_by: userId
        });
        if (images) {
            json = [];
            for (x in images) {
                var temp = await ProviderServiceImage.getJson(images[x]);
                if (temp && temp.length > 0) {
                    for (y in temp) {
                        json.push(temp[y]);
                    }
                }
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
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
