const api = require('../../models/Api');

module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const userId = req.authUser.id;

    try {
        const list = [];
        if (userId) {
            var favorites = await Favorite.find({
                created_by: userId
            }).sort('created_at desc');
            if (favorites.length > 0) {
                for (const favorite of favorites) {
                    list.push(await Favorite.getJson(favorite, true));
                }
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = list;
                return res.json(response);
            } else {
                response.message = sails.__('No favorite found');
                return res.send(response);
            }
        } else {
            response.message = sails.__('No user found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        switch (err.name) {
            case 'UsageError':
                response.message = err.name;
                return res.send(response);
            default:
                response.message = err.name;
                return res.send(response);
        }
    }
};
