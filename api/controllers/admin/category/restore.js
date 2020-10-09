module.exports = async function restore(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var category = await Category.find({
            id: id,
            deleted_at: { '!=': null }
        }).limit(1);
        if (category.length > 0) {
            await Category.update({
                id: id
            }).set({
                deleted_at: null
            });
            response.status = 'OK';
            response.message = sails.__('Category restored');
            return res.send(response);
        }
        response.message = sails.__('Category not found');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
