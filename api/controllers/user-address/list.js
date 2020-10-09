module.exports = async function add(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const userId = req.authUser.id;

    try {
        var addresses = await UserAddress.find({
            created_by: userId,
            status: sails.config.constants.STATUS_ACTIVE
        }).sort('is_default DESC');
        if (addresses && addresses.length > 0) {
            const address_model = [];
            addresses.forEach(function(address, index) {
                address_model.push(UserAddress.getJson(address));
            });
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = address_model;
            return res.json(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No address found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
