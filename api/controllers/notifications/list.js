module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const user = req.authUser;

    try {
        var notificationList = [];
        if (user) {
            var tags = Notifications.getMyTags(user);
            var notifications = await Notifications.find({
                or: [
                    {
                        created_by: user.id,
                        status:
                            sails.config.constants
                                .NOTIFICATION_STATUS_FOR_INDIVIDUAL
                    },
                    {
                        created_by: null,
                        created_at: {
                            '>': req.authUser.created_at
                        },
                        status: {
                            in: tags
                        }
                    }
                ]
            })
                .sort('created_at DESC')
                .limit(50);
            if (notifications.length > 0) {
                for (const notification of notifications) {
                    notificationList.push(
                        await Notifications.getJson(notification)
                    );
                }
                response.status = 'OK';
                response.message = sails.__('Success');
                response.data = notificationList;
                return res.json(response);
            } else {
                response.message = sails.__('No notification found');
                return res.send(response);
            }
        } else {
            response.message = sails.__('No notification found');
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
