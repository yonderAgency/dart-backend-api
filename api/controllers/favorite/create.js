module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const name = req.param('name');
    const providerId = req.param('providerId');
    const userId = req.authUser.id;

    if (typeof providerId == 'undefined' || typeof name == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var existingWish = await Favorite.find({
            name: name,
            created_by: userId
        }).limit(1);
        if (existingWish && existingWish.length > 0) {
            response.message = sails.__(
                'Favorite list with this name already exists'
            );
            return res.send(response);
        }
        await Favorite.create({
            name: name,
            created_by: userId
        });
        if (typeof providerId != 'undefined' && providerId != '') {
            var favorite = await Favorite.find({
                name: name,
                created_by: userId
            }).limit(1);
            if (favorite && favorite.length > 0) {
                await Favoriteservice.create({
                    favorite_id: favorite[0].id,
                    provider_id: providerId,
                    created_by: userId
                });
            }
        }
        response.status = 'OK';
        response.message = sails.__('Favorite added successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
