const moment = require('moment');

module.exports = async function deleted(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var loggedInUser = req.authUser.id;
    var ids = req.param('ids');

    if (!Array.isArray(ids) && ids.length > 0) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        for (x in ids) {
            var category = await Category.find({
                id: ids[x].trim()
            }).limit(1);

            if (category.length > 0) {
                await Category.update({
                    id: ids[x].trim()
                }).set({
                    deleted_at: moment().valueOf(),
                    deleted_by: loggedInUser
                });
            }
        }
        response.status = 'OK';
        response.message = sails.__('Category marked deleted');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
