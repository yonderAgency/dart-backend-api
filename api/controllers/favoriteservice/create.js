module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: 0 };
    const providerId = req.param('providerId');
    const favoriteId = req.param('favId');
    const userId = req.authUser.id;

    if (typeof providerId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var favorite = [];
        if (
            typeof favoriteId == 'undefined' ||
            favoriteId == null ||
            favoriteId == ''
        ) {
            favorite = await Favorite.find({
                type_id: sails.config.constants.FAVORITE_DEFAULT,
                created_by: userId
            }).limit(1);
        } else {
            favorite = await Favorite.find({
                id: favoriteId,
                created_by: userId
            }).limit(1);
        }
        if (favorite && favorite.length > 0) {
            var fetch = await Favoriteservice.find({
                favorite_id: favorite[0].id,
                provider_id: providerId,
                created_by: userId
            }).limit(1);
            if (fetch && fetch.length > 0) {
                await Favoriteservice.destroy({
                    favorite_id: favorite[0].id,
                    provider_id: providerId,
                    created_by: userId
                });
                response.status = 'OK';
                response.message = sails.__('Favorite removed successfully');
                return res.send(response);
            } else {
                await Favoriteservice.create({
                    favorite_id: favorite[0].id,
                    provider_id: providerId,
                    created_by: userId
                });
                response.status = 'OK';
                response.data = 1;
                response.message = sails.__('Favorite added successfully');
                return res.send(response);
            }
        } else {
            response.message = sails.__('Unable to add favorite');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
