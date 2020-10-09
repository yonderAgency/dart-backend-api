module.exports = async function all(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const limit = 50;
    var ratingList = [];
    var providerId = req.param('providerId');

    try {
        var ratings = [];
        if (typeof providerId != 'undefined' && providerId != '') {
            ratings = await Rating.find({
                to_id: providerId
            })
                .limit(limit)
                .sort('created_at DESC');
        } else {
            ratings = await Rating.find()
                .limit(limit)
                .sort('created_at DESC');
        }
        if (ratings.length > 0) {
            for (x in ratings) {
                ratingList.push(await Rating.getJson(ratings[x]));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = ratingList;
            return res.json(response);
        } else {
            response.message = sails.__('No rating found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
