module.exports = async function read(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const user = req.authUser;
    const id = req.param('notID');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var notifications = await Notifications.find({
            created_by: user.id,
            status: sails.config.constants.NOTIFICATION_STATUS_FOR_INDIVIDUAL,
            id: id
        }).limit(1);
        if (notifications.length > 0) {
            var notifications = await Notifications.update({
                created_by: user.id,
                status:
                    sails.config.constants.NOTIFICATION_STATUS_FOR_INDIVIDUAL,
                id: id
            }).set({
                is_read: sails.config.constants.READ_TRUE
            });
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = notificationList;
            return res.json(response);
        } else {
            response.message = sails.__('Notification not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
