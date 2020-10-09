const moment = require('moment');

module.exports = async function rebook(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const bookingId = req.param('bookingId');
    const date = req.param('date');
    const time = req.param('time');
    const note = req.param('note');
    const payment_type = req.param('paymentType');
    const customer_address_id = req.param('customerAddressId');
    const loggedInUser = req.authUser.id;

    if (
        typeof bookingId == 'undefined' &&
        typeof date == 'undefined' &&
        typeof time == 'undefined' &&
        typeof payment_type == 'undefined' &&
        typeof customer_address_id == 'undefined'
    ) {
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

        var providerId = oldBooking[0].provider_id;
        var proPackageId = bookingItem[0].package_id;
        var proServiceId = bookingItem[0].item_id;

        var datetime = date + ' ' + time;
        var datetimeValue = moment.utc(datetime);
        datetimeValue = datetimeValue.valueOf();

        var token =
            sails.config.dynamics.BOOKING_PREFIX + (await Api.generatedCode(6));
        var booking = {};
        booking.provider_id = providerId;
        booking.token = token;
        booking.datetime = parseInt(datetimeValue);
        booking.customer_address_id = customer_address_id;
        booking.note = note;
        booking.payment_type = payment_type;
        booking.status = 1;
        booking.ipAddress = User.pushIpData(
            Api.filterIp(req.ip),
            null,
            req.options.action
        );
        booking.created_by = loggedInUser;
        Booking.create(booking, async function(err, book) {
            if (err) {
                response.message = err.details;
                return res.send(response);
            }

            const createdBooking = await Booking.find({
                token: token
            }).limit(1);
            const providerService = await ProviderService.find({
                id: proServiceId
            }).limit(1);

            if (createdBooking.length > 0 && providerService.length > 0) {
                await BookingItem.create({
                    category_id: proPackageId[0].category_id,
                    service_id: proPackageId[0].service_id,
                    item_id: proServiceId,
                    package_id: proPackageId,
                    booking_id: createdBooking[0].id,
                    created_by: loggedInUser
                });
                const amount = await Booking.getTotalAmount(createdBooking[0]);
                await Booking.update({
                    id: createdBooking[0].id
                }).set({
                    total_amount: amount
                });

                var user = await User.find({ id: providerId }).limit(1);
                let websiteImages = await Api.getWebsiteImage();
                sails.hooks.email.send(
                    'booking',
                    {
                        name: user[0].name,
                        token: createdBooking[0].token,
                        image: websiteImages
                    },
                    {
                        to: user[0].email,
                        subject: sails.__(
                            'New Booking at %s',
                            sails.config.dynamics.APPLICATION_NAME
                        )
                    },
                    function(err) {
                        if (err) {
                            response.message = err;
                            return res.json(response);
                        }
                        response.status = 'OK';
                        response.message = sails.__(
                            'Booking created successfully'
                        );
                        return res.send(response);
                    }
                );
            }
        });
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
