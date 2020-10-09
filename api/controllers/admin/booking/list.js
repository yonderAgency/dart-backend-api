module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var userId = req.param('customerId');

    if (typeof userId == undefined) {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    try {
        var bookings = await Booking.find({
            where: { created_by: userId }
        });
        if (bookings.length > 0) {
            var json = [];
            for (x in bookings) {
                json.push(await Booking.getJson(bookings[x]));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.json(response);
        } else {
            response.message = sails.__('No booking found');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
