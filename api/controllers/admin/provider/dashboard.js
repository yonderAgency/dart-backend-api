module.exports = async function dashboard(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.param('providerId');

    if (typeof providerId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    const user = await User.find({
        id: providerId
    }).limit(1);

    try {
        if (user && user.length > 0) {
            let completedBookings = await Booking.count({
                where: {
                    provider_id: providerId,
                    status: [
                        sails.config.constants.BOOKING_STATUS_COMPLETED,
                        sails.config.constants.BOOKING_STATUS_ENDED
                    ]
                }
            });
            let pendingBookings = await Booking.count({
                where: {
                    status: sails.config.constants.BOOKING_STATUS_INITIATED,
                    provider_id: providerId
                }
            });
            let inProgressBookings = await Booking.count({
                where: {
                    status: sails.config.constants.BOOKING_STATUS_CONFIRMED,
                    provider_id: providerId
                }
            });
            let rating = await RatingLog.find({
                created_by: providerId
            });
            let ratingBalance = 0;
            if (rating && rating.length > 0) {
                ratingBalance = rating[0].ar;
            }
            const providerProfileData = await ProviderProfile.getData(req.id);
            var due_amount = providerProfileData.due_amount
                ? providerProfileData.due_amount
                : 0.0;

            response.status = 'OK';
            response.data = {
                rating: ratingBalance.toFixed(2),
                completedBookings: completedBookings,
                pendingBookings: pendingBookings,
                inProgressBookings: inProgressBookings,
                due_amount: due_amount
            };
            response.message = sails.__('Success');
            return res.send(response);
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
