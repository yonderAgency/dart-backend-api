module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    try {
        var cities = await Cities.find();
        if (cities && cities.length > 0) {
            var json = [];
            for (x in cities) {
                json.push(await Cities.getJson(cities[x]));
            }
            response.data = json;
            response.status = 'OK';
            response.message = sails.__('Success');
            return res.json(response);
        }
        response.status = 'OK';
        response.message = sails.__('No city found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
