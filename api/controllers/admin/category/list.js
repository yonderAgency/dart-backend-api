module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    try {
        var categories = await Category.find();
        if (categories) {
            const allCategories = await Category.getAdminAll(categories, true);
            if (allCategories.length > 0) {
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = allCategories;
                return res.json(response);
            }
        }
        response.status = 'OK';
        response.message = sails.__('No category found');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
