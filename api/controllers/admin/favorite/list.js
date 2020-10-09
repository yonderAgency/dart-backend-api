module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var userId = req.param('customerId');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var favorites = await Favorite.find({ created_by: userId });
        if (favorites.length > 0) {
            var json = [];
            for (x in favorites) {
                json.push(await Favorite.getJson(favorites[x], true));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.json(response);
        } else {
            response.message = sails.__('No favorite list found');
            return res.json(response);
        }
    } catch (err) {
        response.message = sails.__('Internal server error');
        return res.json(response);
    }
};
