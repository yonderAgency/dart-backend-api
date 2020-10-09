const path = require('path');
const { constants } = require('../../../config/constants');
module.exports = async function uploadDocs(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    let providerId;
    if (req.authUser.role == constants.ROLE_ADMIN) {
        providerId = req.param('providerId');
    } else {
        providerId = req.authUser.id;
    }

    try {
        var records = await ProviderDocument.find({
            where: { user_id: providerId }
        });
        response.status = 'OK';
        response.data = records;
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
