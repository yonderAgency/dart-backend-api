module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var category = await Category.find({
            id: id
        }).limit(1);

        if (category.length > 0) {
            const categoryDetail = await Category.getJson(category[0], true);
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = categoryDetail;
            return res.json(response);
        } else {
            response.message = sails.__('No category found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
