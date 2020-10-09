module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var userId = req.param('userId');
    const limit = req.param('limit') || 20;

    if (typeof userId == 'undefined' || userId == null || userId == '') {
        if (req.headers['x-auth-token']) {
            userId = await Api.getLoggedInUserId(req.headers);
        }
    }

    try {
        var ratingLog = await RatingLog.find({
            created_by: userId
        }).limit(1);
        if (typeof userId == 'undefined' || userId == null || userId == '') {
            ratingLog = [];
        }
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
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
