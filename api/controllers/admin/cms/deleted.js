var moment = require('moment');

module.exports = async function deleted(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const loggedInUser = req.authUser.id;
    const ids = req.param('ids');

    if (typeof ids == 'undefined' && ids.length > 0) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (ids.length > 0) {
            for (x in ids) {
                var cms = await Cms.find({
                    id: ids[x]
                }).limit(1);

                if (!cms || cms.length == 0) {
                    response.message = sails.__('CMS page not found');
                    return res.send(response);
                }

                if (cms && cms.length > 0) {
                    await Cms.destroy({ id: ids[x] });
                    // await Cms.update({
                    //     id: ids[x]
                    // }).set({
                    //     deleted_by: loggedInUser,
                    //     deleted_at: moment().valueOf()
                    // });
                }
            }
            response.status = 'OK';
            response.message = sails.__('CMS Page marked deleted');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
