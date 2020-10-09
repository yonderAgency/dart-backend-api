const db = BookingItem.getDatastore().manager;

module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var limit = req.param('limit');

    if (typeof limit == 'undefined') {
        limit = 5;
    }

    try {
        var items = await db
            .collection('bookingitem')
            .aggregate([
                {
                    $project: {
                        package_id: 1,
                    },
                },
                {
                    $unwind: '$package_id',
                },
                {
                    $group: {
                        _id: '$package_id.service_id',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ])
            .toArray();
        var json = [];
        if (limit > items.length) {
            limit = items.length;
        }
        if (items && items.length > 0) {
            for (var i = 1; i <= limit; i++) {
                var service = await Service.find({
                    id: items[i - 1]._id,
                    status: sails.config.constants.STATUS_ACTIVE,
                    deleted_at: null,
                }).limit(1);
                if (service && service.length > 0) {
                    json.push(await Service.getJson(service[0], true));
                }
            }
        }
        if (json.length > 0) {
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = json;
            return res.send(response);
        } else {
            response.message = sails.__('No service found');
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
