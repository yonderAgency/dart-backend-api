const moment = require('moment');

module.exports = async function deleted(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var loggedInUser = req.authUser.id;
    var ids = req.param('ids');

    if (!Array.isArray(ids)) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (ids.length > 0) {
            for (x in ids) {
                var service = await Service.find({
                    id: ids[x].trim()
                }).limit(1);

                if (service.length > 0) {
                    await Service.update({
                        id: ids[x].trim()
                    }).set({
                        deleted_at: moment().valueOf(),
                        deleted_by: loggedInUser
                    });
                }
            }
            response.status = 'OK';
            response.message = sails.__('Service marked deleted');
            return res.json(response);
        } else {
            response.message == sails.__('Invalid request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
