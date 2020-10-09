module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    try {
        var banners = await Banners.find();
        if (banners.length > 0) {
            var json = [];
            for (x in banners) {
                json.push(await Banners.getJson(banners[x]));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.json(response);
        } else {
            response.message = sails.__('No banner found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
