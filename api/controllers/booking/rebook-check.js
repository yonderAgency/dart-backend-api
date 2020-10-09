module.exports = async function rebookCheck(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedInUser = req.authUser.id;
    const bookingId = req.param('bookingId');

    if (typeof bookingId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var oldBooking = await Booking.find({
            id: bookingId
        }).limit(1);
        var bookingItem = await BookingItem.find({
            booking_id: bookingId
        }).limit(1);

        if (
            oldBooking &&
            oldBooking.length > 0 &&
            bookingItem &&
            bookingItem.length > 0
        ) {
            if (
                oldBooking[0].status ==
                    sails.config.constants.BOOKING_STATUS_CANCELLED ||
                oldBooking[0].status ==
                    sails.config.constants.BOOKING_STATUS_REJECTED ||
                oldBooking[0].status ==
                    sails.config.constants.BOOKING_STATUS_ENDED ||
                oldBooking[0].status ==
                    sails.config.constants.BOOKING_STATUS_COMPLETED ||
                oldBooking[0].status ==
                    sails.config.constants.BOOKING_STATUS_CANCELLED_PROVIDER
            ) {
                const providerId = oldBooking[0].provider_id;
                const proPackageId = bookingItem[0].package_id;
                const proServiceId = bookingItem[0].item_id;
                const payment_type = bookingItem[0].payment_type;
                const provider = await User.find({
                    id: providerId
                }).limit(1);

                response.data.providerDetail = await User.getProviderJson(
                    provider[0],
                    bookingItem[0].service_id,
                    loggedInUser,
                    false,
                    req.location
                );
                response.data.webServiceId = bookingItem[0].service_id;
                response.data.serviceId = proServiceId;
                response.data.providerDetail.proServiceId = proServiceId;
                response.data.payment_type = null;
                response.data.packageSelected = null;
                if (proPackageId != null && proPackageId != '') {
                    var package = await ProviderServiceAddon.find({
                        id: proPackageId
                    }).limit(1);
                    if (package && package.length > 0) {
                        response.data.packageSelected = await ProviderServiceAddon.getJson(
                            package[0]
                        );
                    }
                }
                response.status = 'OK';
                response.message = sails.__('Rebooking done successfully');
                return res.send(response);
            } else {
                response.message = sails.__('This booking cannot be rebooked');
                return res.send(response);
            }
        } else {
            response.message = sails.__('Invalid request');
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
