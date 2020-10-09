module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const userId = req.param('providerId');
    const limit = 100;

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var ratingLog = await RatingLog.find({
            created_by: userId
        }).limit(1);
        if (ratingLog.length > 0) {
            const ratingList = await RatingLog.getJson(limit, ratingLog[0]);
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = ratingList;
            return res.json(response);
        } else {
            const ratingList = await RatingLog.getJson(limit, null);
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = ratingList;
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
