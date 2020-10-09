module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    let providerId = req.param('providerId');

    try {
        var images = [];
        if(typeof providerId != "undefined" && providerId != "") {
            images = await ProviderServiceImage.find({
                created_by: providerId
            });
        } else {
            images = await ProviderServiceImage.find();
        }
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
            if (json.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = json;
                return res.json(response);
            }
            response.message = sails.__('No image found');
            return res.send(response);
        } else {
            response.message = sails.__('No image found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
