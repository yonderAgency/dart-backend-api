const db = BookingItem.getDatastore().manager;

module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var limit = req.param('limit');

    if (typeof limit == 'undefined') {
        limit = 7;
    }
    var json = [];
    try {
        var randm = Math.floor(Math.random());
        if(randm < 0)  {
            randm = 0;
        }
        var categories = await Category.find({
            where: { status: sails.config.constants.STATUS_ACTIVE },
            skip: randm, 
            limit: limit
        });
        if (categories && categories.length > 0) {
            for(x in categories) {
                json.push(await Category.getJson(categories[x]));
            }
        }
        if (json.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.send(response);
        } else {
            response.message = sails.__('No category found');
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
