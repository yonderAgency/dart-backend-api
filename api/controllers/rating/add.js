const moment = require('moment');

module.exports = async function add(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var userId = req.authUser.id;
    const r1 = req.param('r1');
    const r2 = req.param('r2');
    const r3 = req.param('r3');
    const bookingToken = req.param('bookingToken');
    const review = req.param('review');

    if (
        typeof r1 == 'undefined' ||
        typeof r2 == 'undefined' ||
        typeof r3 == 'undefined' ||
        typeof review == 'undefined' ||
        typeof bookingToken == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const booking = await Booking.find({
            token: bookingToken
        }).limit(1);
        if (booking.length > 0) {
            var rating = {};
            rating.r1 = parseFloat(r1);
            rating.r2 = parseFloat(r2);
            rating.r3 = parseFloat(r3);
            var ar = (rating.r1 + rating.r2 + rating.r3) / 3;
            rating.ar = parseFloat(ar);

            if (booking[0].created_by == userId) {
                rating.to_id = booking[0].provider_id;
                rating.from_id = booking[0].created_by;
                rating.type =
                    sails.config.constants.RATING_CUSTOMER_TO_PROVIDER;
            } else {
                rating.from_id = booking[0].provider_id;
                rating.to_id = booking[0].created_by;
                rating.type =
                    sails.config.constants.RATING_PROVIDER_TO_CUSTOMER;
            }
            rating.booking_id = booking[0].id;
            rating.review = review;
            if (
                typeof review != 'undefined' &&
                review != '' &&
                review != null
            ) {
                rating.has_reviewed = sails.config.constants.HAS_REVIEWED_TRUE;
            }

            Rating.create(rating, async function(err, pack) {
                if (err) {
                    sails.sentry.captureException(err);
                    response.message = sails.__(
                        'We are very sorry, it is taking more than expected time. Please try again!'
                    );
                    return res.send(response);
                }
                var main = await RatingLog.find({
                    created_by: rating.to_id
                }).limit(1);

                if (main && main.length > 0) {
                } else {
                    await RatingLog.intialCreate(rating.to_id);
                    main = await RatingLog.find({
                        created_by: rating.to_id
                    }).limit(1);
                }

                var newReviewCount = main[0].review_count;
                if (
                    typeof review != 'undefined' &&
                    review != '' &&
                    review != null
                ) {
                    newReviewCount = newReviewCount + 1;
                }

                var r1Value =
                    (parseFloat(main[0].r1) * main[0].r1_count +
                        parseFloat(r1)) /
                    (parseFloat(main[0].r1_count) + 1);
                var r2Value =
                    (parseFloat(main[0].r2) * main[0].r2_count +
                        parseFloat(r2)) /
                    (parseFloat(main[0].r2_count) + 1);
                var r3Value =
                    (parseFloat(main[0].r3) * main[0].r3_count +
                        parseFloat(r3)) /
                    (parseFloat(main[0].r3_count) + 1);
                var arValue =
                    (parseFloat(main[0].ar) * main[0].ar_count +
                        parseFloat(ar)) /
                    (parseFloat(main[0].ar_count) + 1);

                var r1CountValue = main[0].r1_count + 1;
                var r2CountValue = main[0].r2_count + 1;
                var r3CountValue = main[0].r3_count + 1;
                var arCountValue = main[0].ar_count + 1;
                await RatingLog.update({
                    created_by: rating.to_id
                }).set({
                    r1: r1Value,
                    r1_count: r1CountValue,
                    r2: r2Value,
                    r2_count: r2CountValue,
                    r3: r3Value,
                    r3_count: r3CountValue,
                    ar: arValue,
                    ar_count: arCountValue,
                    review_count: newReviewCount,
                    updated_at: await sails.helpers.timestamp.with({
                        datetime: moment.utc().format('YYYY-MM-DD HH:mm:ss')
                    })
                });
                if (
                    rating.type ==
                    sails.config.constants.RATING_PROVIDER_TO_CUSTOMER
                ) {
                    await Booking.update({
                        token: bookingToken
                    }).set({
                        provider_reviewed: true
                    });
                } else {
                    await Booking.update({
                        token: bookingToken
                    }).set({
                        customer_reviewed: true
                    });
                }
                response.status = 'OK';
                response.message = sails.__('Rating added successfully');
                return res.send(response);
            });
        } else {
            response.message = sails.__('Booking not found');
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
