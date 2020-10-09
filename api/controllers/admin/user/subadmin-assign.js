module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const userId = req.param('id');

    try {
        var assignModel = await Assign.find({
            userId: userId
        });
        if (assignModel.length > 0) {
            var model = await Assign.getJson(assignModel[0]);
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = model;
            return res.send(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No assign found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
