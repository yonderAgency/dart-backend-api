module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    try {
        var cms = await Cms.find({
            deleted_at: null
        });
        if (cms && cms.length > 0) {
            var json = [];
            for (x in cms) {
                json.push(await Cms.getJson(cms[x]));
            }
            response.data = json;
            response.status = 'OK';
            response.message = sails.__('Success');
            return res.json(response);
        }
        response.status = 'OK';
        response.message = sails.__('No CMS page found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
