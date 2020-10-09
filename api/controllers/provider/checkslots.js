const moment = require('moment');

module.exports = async function bookings(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const day = req.param('day');
    const providerId = req.param('providerId');

    var currentDate = req.param('currentDate');
    var bookingDate = req.param('date');
    var offset = req.param('offset');
    var tempCurrentDate = currentDate;

    if (
        typeof providerId == 'undefined' ||
        typeof day == 'undefined' ||
        typeof currentDate == 'undefined' ||
        typeof bookingDate == 'undefined' ||
        typeof offset == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    
    try {
        currentDate = moment(currentDate);
        bookingDate = moment(bookingDate);
        const user = await User.find({
            id: providerId,
            is_blocked: sails.config.constants.IS_UNBLOCKED,
            is_deleted: sails.config.constants.IS_IS_ACTIVE,
            status: sails.config.constants.STATUS_ACTIVE
        }).limit(1);
        if (user && user.length > 0) {
            const hours = await ProviderBusinessHours.find({
                created_by: providerId
            }).limit(1);
            if (hours && hours.length > 0) {
                var mainFetchPacket = null;
                for (x in hours[0].timing_packet) {
                    if (hours[0].timing_packet[x].key == day) {
                        mainFetchPacket = hours[0].timing_packet[x];
                    }
                }
                if (
                    typeof mainFetchPacket != 'undefined' &&
                    mainFetchPacket != null &&
                    mainFetchPacket.status
                ) {
                    if (
                        typeof mainFetchPacket.startTime != 'undefined' &&
                        typeof mainFetchPacket.endTime != 'undefined'
                    ) {
                        let dateBoolean = false;
                        if (currentDate.isSame(bookingDate, 'date')) {
                            dateBoolean = true;
                        }
                        response.data.slots = await Api.fetchSlots(
                            tempCurrentDate,
                            dateBoolean,
                            offset,
                            mainFetchPacket.startTime,
                            mainFetchPacket.endTime
                        );
                        response.message = sails.__('Success');
                        response.status = 'OK';
                        return res.send(response);
                    } else {
                        response.message = sails.__(
                            'Sorry, provider is not available at the selected date!'
                        );
                        return res.send(response);
                    }
                } else {
                    response.message = sails.__(
                        'Sorry, the provider does not work on the selected day!'
                    );
                    return res.send(response);
                }
            } else {
                response.message = sails.__(
                    'Sorry, the provider does not work on the selected day!'
                );
                return res.send(response);
            }
        } else {
            response.message = sails.__('No such provider found');
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
